using Microsoft.Extensions.Configuration;
using OscApi.Common;
using OscApi.Dtos.Payments;
using OscApi.Models;
using OscApi.Services;
using OscApi.Tests.Helpers;

namespace OscApi.Tests.Services;

public class PaymentServiceTests
{
    private static IConfiguration EmptyConfig() =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();

    private static (PaymentService Service, FakeFlutterwaveClient Flutterwave, string DbName) CreateService(string businessType = "limited-company")
    {
        var dbName = Guid.NewGuid().ToString();
        var db = TestDbFactory.Create(dbName);
        db.BusinessRegistrations.Add(new OscApi.Models.BusinessRegistration
        {
            ReferenceNumber = "REG-2026-0001",
            BusinessName = "Test Traders Ltd",
            BusinessType = businessType,
            BusinessStructure = "private",
            Sector = "ICT",
            Location = "Kampala",
            ContactName = "Jane Doe",
            ContactEmail = "jane@example.com",
        });
        db.SaveChanges();

        var flutterwave = new FakeFlutterwaveClient();
        var service = new PaymentService(db, flutterwave, new AuditLogService(db), EmptyConfig());
        return (service, flutterwave, dbName);
    }

    [Fact]
    public async Task InitiatePaymentAsync_CreatesPendingPayment_ForTheScheduledFee()
    {
        var (svc, flutterwave, _) = CreateService(businessType: "limited-company");

        var result = await svc.InitiatePaymentAsync("REG-2026-0001");

        Assert.Equal("pending", result.Status);
        Assert.Equal(650_000m, result.Amount); // limited-company fee
        Assert.Equal("UGX", result.Currency);
        Assert.Equal(flutterwave.LinkToReturn, result.PaymentLink);
        Assert.Equal(650_000m, flutterwave.LastInitiatedAmount); // never a client-supplied amount
    }

    [Fact]
    public async Task InitiatePaymentAsync_UnknownRegistration_Throws()
    {
        var (svc, _, _) = CreateService();
        await Assert.ThrowsAsync<KeyNotFoundException>(() => svc.InitiatePaymentAsync("NOPE"));
    }

    [Fact]
    public async Task InitiatePaymentAsync_AlreadyPaid_ReturnsExistingPayment_WithoutChargingAgain()
    {
        var (svc, flutterwave, dbName) = CreateService();
        var db = TestDbFactory.Create(dbName);
        db.Payments.Add(new Payment
        {
            BusinessRegistrationRef = "REG-2026-0001",
            TxRef = "REG-2026-0001-already",
            Amount = 650_000m,
            Currency = "UGX",
            Status = PaymentStatus.Successful,
            PaidAt = DateTimeOffset.UtcNow,
        });
        db.SaveChanges();

        var result = await svc.InitiatePaymentAsync("REG-2026-0001");

        Assert.Equal("successful", result.Status);
        Assert.Null(flutterwave.LastInitiatedTxRef); // Flutterwave was never called again
    }

    [Fact]
    public async Task GetStatusAsync_NoPaymentYet_ReportsNotInitiated_WithTheExpectedFee()
    {
        var (svc, _, _) = CreateService(businessType: "sole-proprietorship");
        var status = await svc.GetStatusAsync("REG-2026-0001");

        Assert.NotNull(status);
        Assert.Equal("not_initiated", status!.Status);
        Assert.Equal(250_000m, status.Amount);
    }

    [Fact]
    public async Task HandleWebhookAsync_InvalidSignature_IsRejected()
    {
        var (svc, flutterwave, _) = CreateService();
        flutterwave.SignatureValid = false;

        var handled = await svc.HandleWebhookAsync("bad-hash",
            new FlutterwaveWebhookIncoming { Event = "charge.completed", Data = new FlutterwaveWebhookData { Id = 1, TxRef = "x", Status = "successful" } });

        Assert.False(handled);
    }

    [Fact]
    public async Task HandleWebhookAsync_ReVerifiedSuccessful_MarksPaymentPaid()
    {
        var (svc, flutterwave, dbName) = CreateService();
        var initiated = await svc.InitiatePaymentAsync("REG-2026-0001");

        flutterwave.TransactionOnVerify = new FlutterwaveTransaction
        {
            Id = 999, TxRef = initiated.TxRef, Amount = initiated.Amount, Currency = "UGX", Status = "successful",
        };

        var handled = await svc.HandleWebhookAsync("valid-hash",
            new FlutterwaveWebhookIncoming { Event = "charge.completed", Data = new FlutterwaveWebhookData { Id = 999, TxRef = initiated.TxRef, Status = "successful" } });

        Assert.True(handled);
        var status = await svc.GetStatusAsync("REG-2026-0001");
        Assert.Equal("successful", status!.Status);
    }

    [Fact]
    public async Task HandleWebhookAsync_WebhookClaimsSuccess_ButReVerificationAmountIsLower_MarksFailed()
    {
        // The whole point of re-verifying server-to-server: a forged webhook body
        // claiming success must not be trusted on its own.
        var (svc, flutterwave, _) = CreateService();
        var initiated = await svc.InitiatePaymentAsync("REG-2026-0001");

        flutterwave.TransactionOnVerify = new FlutterwaveTransaction
        {
            Id = 999, TxRef = initiated.TxRef, Amount = 1m, Currency = "UGX", Status = "successful",
        };

        await svc.HandleWebhookAsync("valid-hash",
            new FlutterwaveWebhookIncoming { Event = "charge.completed", Data = new FlutterwaveWebhookData { Id = 999, TxRef = initiated.TxRef, Status = "successful" } });

        var status = await svc.GetStatusAsync("REG-2026-0001");
        Assert.Equal("failed", status!.Status);
    }

    [Fact]
    public async Task HandleWebhookAsync_ProviderVerificationUnavailable_LeavesPaymentPendingForRetry()
    {
        var (svc, flutterwave, _) = CreateService();
        var initiated = await svc.InitiatePaymentAsync("REG-2026-0001");

        await Assert.ThrowsAsync<InvalidOperationException>(() => svc.HandleWebhookAsync("valid-hash",
            new FlutterwaveWebhookIncoming
            {
                Event = "charge.completed",
                Data = new FlutterwaveWebhookData { Id = 999, TxRef = initiated.TxRef, Status = "successful" },
            }));

        var status = await svc.GetStatusAsync("REG-2026-0001");
        Assert.Equal("pending", status!.Status);
    }
}
