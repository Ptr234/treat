using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using OtpNet;

namespace OscApi.Tests.Integration;

/// <summary>
/// Upload / document pipeline: files may only be attached to an existing ticket,
/// authorized by the ticket's access token (public) or a staff session, with the type
/// allowlist enforced. Downloads go through the access-checked content endpoint.
/// </summary>
public class UploadIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public UploadIntegrationTests(ApiFactory factory) => _factory = factory;

    private const string FilerEmail = "filer@example.com";

    /// <summary>File a ticket publicly; returns its reference and the filer's access token.</summary>
    private async Task<(string Ref, string Token)> CreateTicketAsync(HttpClient client)
    {
        var res = await client.PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "Upload test", description = "d", category = "general_inquiry",
            priority = "low", contactEmail = FilerEmail, contactName = "Filer",
        });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var data = JsonDocument.Parse(await res.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
        return (data.GetProperty("referenceNumber").GetString()!, data.GetProperty("accessToken").GetString()!);
    }

    private static MultipartFormDataContent BuildUpload(
        string? refNumber, string? token, string mime = "application/pdf", string fileName = "doc.pdf")
    {
        var content = new MultipartFormDataContent();
        var file = new ByteArrayContent(Encoding.UTF8.GetBytes("%PDF-1.4 test"));
        file.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(mime);
        content.Add(file, "files", fileName);
        if (refNumber is not null) content.Add(new StringContent(refNumber), "ticketRefNumber");
        if (token is not null) content.Add(new StringContent(token), "accessToken");
        return content;
    }

    [Fact]
    public async Task Upload_WithoutTicketRef_IsRejected()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsync("/api/v1/upload", BuildUpload(null, "any-token"));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Upload_WithWrongToken_IsRejected()
    {
        var client = _factory.CreateClient();
        var (refNo, _) = await CreateTicketAsync(client);

        // One 404 for "missing" and "not yours", so references can't be probed.
        var res = await client.PostAsync("/api/v1/upload", BuildUpload(refNo, "guessed-token"));
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task Upload_WithDisallowedType_IsRejected()
    {
        var client = _factory.CreateClient();
        var (refNo, token) = await CreateTicketAsync(client);

        var res = await client.PostAsync("/api/v1/upload",
            BuildUpload(refNo, token, mime: "application/x-msdownload", fileName: "evil.exe"));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Upload_ThenListAndDownload_WorksForOwnerOnly()
    {
        var client = _factory.CreateClient();
        var (refNo, token) = await CreateTicketAsync(client);

        // Owner uploads successfully.
        var upload = await client.PostAsync("/api/v1/upload", BuildUpload(refNo, token));
        Assert.Equal(HttpStatusCode.OK, upload.StatusCode);

        // Owner can list the document.
        var list = await client.GetAsync($"/api/v1/tickets/{refNo}/documents?token={token}");
        Assert.Equal(HttpStatusCode.OK, list.StatusCode);
        var docs = JsonDocument.Parse(await list.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data");
        var docId = docs[0].GetProperty("id").GetString();
        Assert.False(string.IsNullOrEmpty(docId));

        // A stranger cannot list or download.
        var strangerList = await client.GetAsync($"/api/v1/tickets/{refNo}/documents?token=guessed");
        Assert.Equal(HttpStatusCode.NotFound, strangerList.StatusCode);
        var strangerDl = await client.GetAsync($"/api/v1/tickets/{refNo}/documents/{docId}/content?token=guessed");
        Assert.Equal(HttpStatusCode.NotFound, strangerDl.StatusCode);

        // The owner downloads the original bytes.
        var download = await client.GetAsync($"/api/v1/tickets/{refNo}/documents/{docId}/content?token={token}");
        Assert.Equal(HttpStatusCode.OK, download.StatusCode);
        Assert.Equal("application/pdf", download.Content.Headers.ContentType?.MediaType);
        Assert.Equal("%PDF-1.4 test", await download.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task StaffUpdate_WithInvalidStatus_Returns400Not500()
    {
        var admin = _factory.CreateClient();
        var login = await admin.PostAsJsonAsync("/api/v1/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        // PATCH /api/v1/tickets is Staff-policy — needs completed TOTP enrolment
        // (MfaCompleteRequirement) or this 400 assertion would see 403 instead.
        var enroll = await admin.PostAsync("/api/v1/auth/mfa/enroll", null);
        var secret = JsonDocument.Parse(await enroll.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("secret").GetString()!;
        var code = new Totp(Base32Encoding.ToBytes(secret)).ComputeTotp();
        await admin.PostAsJsonAsync("/api/v1/auth/mfa/verify", new { code });

        var refNo = await CreateTicketAsync(admin);
        var res = await admin.PatchAsJsonAsync($"/api/v1/tickets/{refNo}", new { status = "not_a_status" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }
}
