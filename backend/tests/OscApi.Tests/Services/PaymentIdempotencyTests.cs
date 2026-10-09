using Microsoft.Extensions.Configuration;
using OscApi.Common;
using OscApi.Dtos.Payments;
using OscApi.Models;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

/// <summary>
/// Paying the registration fee must open at most one checkout per registration:
/// retries and double clicks get the same transaction back, so an applicant
/// can't end up with several payable links (and be charged twice).
/// </summary>
public class PaymentIdempotencyTests
{
    private const string Ref = "REG-2026-0001";

    /// <summary>
    /// Returns a factory giving a fresh service (and DbContext) per call — like a
    /// real request — so state changed between calls is actually re-read rather
    /// than served from one long-lived context's change tracker.
    /// </summary>
    private static (Func<PaymentService> Svc, FakeFlutterwaveClient Fw, string DbName) Create()
    {
        var dbName = Guid.NewGuid().ToString();
        using (var db = TestDbFactory.Create(dbName))
        {
            db.BusinessRegistrations.Add(new BusinessRegistration
            {
                ReferenceNumber = Ref, BusinessName = "Test Traders Ltd", BusinessType = "limited-company",
                BusinessStructure = "private", Sector = "ICT", Location = "Kampala",
                ContactName = "Jane Doe", ContactEmail = "jane@example.com",
            });
            db.SaveChanges();
        }
        var fw = new FakeFlutterwaveClient();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
        return (() =>
        {
            var db = TestDbFactory.Create(dbName);
            return new PaymentService(db, fw, new AuditLogService(db), config);
        }, fw, dbName);
    }

    [Fact]
    public async Task RepeatedInitiation_ReturnsTheSameCheckout_AndOpensOnlyOne()
    {
        var (svc, _, dbName) = Create();

        var first = await svc().InitiatePaymentAsync(Ref);
        var second = await svc().InitiatePaymentAsync(Ref);
        var third = await svc().InitiatePaymentAsync(Ref);

        Assert.Equal(first.TxRef, second.TxRef);
        Assert.Equal(first.TxRef, third.TxRef);
        Assert.Equal(first.PaymentLink, third.PaymentLink);
        Assert.Single(TestDbFactory.Create(dbName).Payments.Where(p => p.BusinessRegistrationRef == Ref));
    }

    [Fact]
    public async Task StaleCheckout_IsClosed_AndANewOneOpened()
    {
        var (svc, _, dbName) = Create();
        var first = await svc().InitiatePaymentAsync(Ref);

        using (var db = TestDbFactory.Create(dbName))
        {
            var p = db.Payments.Single();
            p.CreatedAt = DateTimeOffset.UtcNow - PaymentService.PendingCheckoutReuseWindow - TimeSpan.FromMinutes(5);
            db.SaveChanges();
        }

        var second = await svc().InitiatePaymentAsync(Ref);

        Assert.NotEqual(first.TxRef, second.TxRef);
        var payments = TestDbFactory.Create(dbName).Payments.Where(p => p.BusinessRegistrationRef == Ref).ToList();
        Assert.Single(payments, p => p.Status == PaymentStatus.Pending);
        var closed = Assert.Single(payments, p => p.TxRef == first.TxRef);
        Assert.Equal(PaymentStatus.Failed, closed.Status);
        Assert.Equal("Superseded by a newer checkout", closed.FailureReason);
    }

    [Fact]
    public async Task PayingASupersededLink_IsStillRecorded_AndFlaggedAsDuplicateForRefund()
    {
        var (svc, fw, dbName) = Create();

        // First checkout opened, then (after expiry) a second one.
        var first = await svc().InitiatePaymentAsync(Ref);
        using (var db = TestDbFactory.Create(dbName))
        {
            db.Payments.Single().CreatedAt = DateTimeOffset.UtcNow.AddDays(-2);
            db.SaveChanges();
        }
        var second = await svc().InitiatePaymentAsync(Ref);

        async Task Pay(InitiatePaymentResponse checkout, long id)
        {
            fw.TransactionOnVerify = new FlutterwaveTransaction
            {
                Id = id, TxRef = checkout.TxRef, Amount = checkout.Amount, Currency = "UGX", Status = "successful",
            };
            Assert.True(await svc().HandleWebhookAsync("valid-hash", new FlutterwaveWebhookIncoming
            {
                Event = "charge.completed",
                Data = new FlutterwaveWebhookData { Id = id, TxRef = checkout.TxRef, Status = "successful" },
            }));
        }

        // The applicant pays both links: money moved twice, so both are recorded...
        await Pay(second, 1001);
        await Pay(first, 1002);

        var verify = TestDbFactory.Create(dbName);
        Assert.Equal(2, verify.Payments.Count(p => p.Status == PaymentStatus.Successful));
        // ...and the second one is flagged for a refund.
        Assert.Contains(verify.AuditLogs, a => a.Action == "payments.flutterwave.duplicate");
    }

    [Fact]
    public async Task AlreadyPaid_IsStillReturnedWithoutOpeningANewCheckout()
    {
        var (svc, fw, dbName) = Create();
        var checkout = await svc().InitiatePaymentAsync(Ref);
        fw.TransactionOnVerify = new FlutterwaveTransaction
        {
            Id = 7, TxRef = checkout.TxRef, Amount = checkout.Amount, Currency = "UGX", Status = "successful",
        };
        await svc().HandleWebhookAsync("valid-hash", new FlutterwaveWebhookIncoming
        {
            Event = "charge.completed",
            Data = new FlutterwaveWebhookData { Id = 7, TxRef = checkout.TxRef, Status = "successful" },
        });

        var again = await svc().InitiatePaymentAsync(Ref);

        Assert.Equal("successful", again.Status);
        Assert.Single(TestDbFactory.Create(dbName).Payments);
    }
}
