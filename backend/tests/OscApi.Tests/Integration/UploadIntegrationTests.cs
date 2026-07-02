using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace OscApi.Tests.Integration;

/// <summary>
/// Upload / document pipeline: files may only be attached to an existing ticket,
/// authorized by the filing email (public) or a staff session, with the type
/// allowlist enforced. Downloads go through the access-checked content endpoint.
/// </summary>
public class UploadIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public UploadIntegrationTests(ApiFactory factory) => _factory = factory;

    private const string FilerEmail = "filer@example.com";

    private async Task<string> CreateTicketAsync(HttpClient client)
    {
        var res = await client.PostAsJsonAsync("/api/tickets", new
        {
            title = "Upload test", description = "d", category = "general_inquiry",
            priority = "low", contactEmail = FilerEmail, contactName = "Filer",
        });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        return JsonDocument.Parse(await res.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data").GetProperty("referenceNumber").GetString()!;
    }

    private static MultipartFormDataContent BuildUpload(
        string? refNumber, string? email, string mime = "application/pdf", string fileName = "doc.pdf")
    {
        var content = new MultipartFormDataContent();
        var file = new ByteArrayContent(Encoding.UTF8.GetBytes("%PDF-1.4 test"));
        file.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(mime);
        content.Add(file, "files", fileName);
        if (refNumber is not null) content.Add(new StringContent(refNumber), "ticketRefNumber");
        if (email is not null) content.Add(new StringContent(email), "contactEmail");
        return content;
    }

    [Fact]
    public async Task Upload_WithoutTicketRef_IsRejected()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsync("/api/upload", BuildUpload(null, FilerEmail));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Upload_WithWrongEmail_IsForbidden()
    {
        var client = _factory.CreateClient();
        var refNo = await CreateTicketAsync(client);

        var res = await client.PostAsync("/api/upload", BuildUpload(refNo, "attacker@example.com"));
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task Upload_WithDisallowedType_IsRejected()
    {
        var client = _factory.CreateClient();
        var refNo = await CreateTicketAsync(client);

        var res = await client.PostAsync("/api/upload",
            BuildUpload(refNo, FilerEmail, mime: "application/x-msdownload", fileName: "evil.exe"));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Upload_ThenListAndDownload_WorksForOwnerOnly()
    {
        var client = _factory.CreateClient();
        var refNo = await CreateTicketAsync(client);

        // Owner uploads successfully.
        var upload = await client.PostAsync("/api/upload", BuildUpload(refNo, FilerEmail));
        Assert.Equal(HttpStatusCode.OK, upload.StatusCode);

        // Owner can list the document.
        var list = await client.GetAsync($"/api/tickets/{refNo}/documents?email={FilerEmail}");
        Assert.Equal(HttpStatusCode.OK, list.StatusCode);
        var docs = JsonDocument.Parse(await list.Content.ReadAsStringAsync())
            .RootElement.GetProperty("data");
        var docId = docs[0].GetProperty("id").GetString();
        Assert.False(string.IsNullOrEmpty(docId));

        // A stranger cannot list or download.
        var strangerList = await client.GetAsync($"/api/tickets/{refNo}/documents?email=other@example.com");
        Assert.Equal(HttpStatusCode.Forbidden, strangerList.StatusCode);
        var strangerDl = await client.GetAsync($"/api/tickets/{refNo}/documents/{docId}/content?email=other@example.com");
        Assert.Equal(HttpStatusCode.Forbidden, strangerDl.StatusCode);

        // The owner downloads the original bytes.
        var download = await client.GetAsync($"/api/tickets/{refNo}/documents/{docId}/content?email={FilerEmail}");
        Assert.Equal(HttpStatusCode.OK, download.StatusCode);
        Assert.Equal("application/pdf", download.Content.Headers.ContentType?.MediaType);
        Assert.Equal("%PDF-1.4 test", await download.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task StaffUpdate_WithInvalidStatus_Returns400Not500()
    {
        var admin = _factory.CreateClient();
        var login = await admin.PostAsJsonAsync("/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var refNo = await CreateTicketAsync(admin);
        var res = await admin.PatchAsJsonAsync($"/api/tickets/{refNo}", new { status = "not_a_status" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }
}
