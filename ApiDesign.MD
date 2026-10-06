# REST API Design Standards — C# / ASP.NET Core Reference

A practical reference to the standards and conventions that separate a well-designed REST API from an ad-hoc one. Each section covers the standard, why it matters, and a worked C#/ASP.NET Core example.

---

## 1. Resource Naming

**Standard:** URLs identify *resources* (nouns), not actions (verbs). Use plural nouns, lowercase, hyphens for multi-word segments, and nesting for relationships.

```
GET    /clients                 → list clients
GET    /clients/42               → get client 42
POST   /clients                 → create a client
PUT    /clients/42               → replace client 42
PATCH  /clients/42               → partially update client 42
DELETE /clients/42               → delete client 42
GET    /clients/42/invoices       → invoices belonging to client 42
```

Avoid: `/getClients`, `/client_list`, `/clients/42/deleteInvoice`.

```csharp
[ApiController]
[Route("api/clients")]
public class ClientsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => Ok(_clientService.GetAll());

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id) => Ok(_clientService.GetById(id));

    [HttpGet("{id:int}/invoices")]
    public IActionResult GetInvoices(int id) => Ok(_invoiceService.GetForClient(id));
}
```

---

## 2. HTTP Methods (Verbs) Used Correctly

| Method | Meaning | Idempotent? | Has Body? |
|---|---|---|---|
| GET | Retrieve a resource | Yes | No |
| POST | Create a resource / trigger an action | No | Yes |
| PUT | Replace a resource entirely | Yes | Yes |
| PATCH | Partially update a resource | No* | Yes |
| DELETE | Remove a resource | Yes | No (usually) |

*PATCH is often implemented idempotently in practice, but the spec doesn't require it.

```csharp
[HttpPatch("{id:int}")]
public IActionResult UpdatePartial(int id, [FromBody] JsonPatchDocument<Client> patch)
{
    var client = _clientService.GetById(id);
    if (client is null) return NotFound();

    patch.ApplyTo(client, ModelState);
    if (!ModelState.IsValid) return ValidationProblem(ModelState);

    _clientService.Update(client);
    return NoContent();
}
```

---

## 3. HTTP Status Codes Used Precisely

Don't return `200 OK` for everything. Status codes carry meaning clients rely on.

| Code | Use |
|---|---|
| 200 OK | Successful GET/PUT/PATCH with a body |
| 201 Created | Successful POST that created a resource (include `Location` header) |
| 202 Accepted | Request accepted for async processing |
| 204 No Content | Successful action with no response body (DELETE, some PUT) |
| 400 Bad Request | Malformed request / validation failure |
| 401 Unauthorized | Missing or invalid authentication |
| 403 Forbidden | Authenticated but not permitted |
| 404 Not Found | Resource doesn't exist |
| 409 Conflict | State conflict (e.g., duplicate, version mismatch) |
| 422 Unprocessable Entity | Semantically invalid data |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Unhandled server-side failure |

```csharp
[HttpPost]
public IActionResult Create([FromBody] CreateClientRequest request)
{
    var client = _clientService.Create(request);
    return CreatedAtAction(nameof(GetById), new { id = client.Id }, client); // 201 + Location header
}

[HttpDelete("{id:int}")]
public IActionResult Delete(int id)
{
    var deleted = _clientService.Delete(id);
    return deleted ? NoContent() : NotFound(); // 204 or 404
}
```

---

## 4. Consistent Error Response Format (RFC 7807 — Problem Details)

**Standard:** Don't invent a bespoke error shape per endpoint. Use a consistent structure — RFC 7807 `application/problem+json` is the widely adopted standard, and ASP.NET Core supports it natively.

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "detail": "Email is required.",
  "instance": "/api/clients",
  "errors": {
    "Email": ["Email is required."]
  }
}
```

```csharp
// Program.cs — enable ProblemDetails globally
builder.Services.AddProblemDetails();

// Custom exception middleware maps exceptions to Problem Details
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred.",
            Detail = feature?.Error.Message,
            Instance = context.Request.Path
        };
        context.Response.StatusCode = problem.Status.Value;
        await context.Response.WriteAsJsonAsync(problem);
    });
});
```

---

## 5. Versioning

**Standard:** APIs change; clients shouldn't break when they do. Pick one versioning strategy and apply it consistently — URL-path versioning is the most common and cache-friendly.

```
/api/v1/clients
/api/v2/clients
```

```csharp
// Using Asp.Versioning.Mvc
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/clients")]
public class ClientsV1Controller : ControllerBase { /* ... */ }

[ApiController]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/clients")]
public class ClientsV2Controller : ControllerBase { /* adds new fields, breaking changes isolated here */ }
```

Alternatives: header versioning (`Api-Version: 2.0`) or media-type versioning (`Accept: application/vnd.example.v2+json`) — less visible in URLs, more "correct" per REST purists, but harder to test casually in a browser.

---

## 6. Pagination, Filtering, and Sorting

**Standard:** Never return an unbounded list. Support pagination as a first-class citizen, plus consistent filter/sort query parameters.

```
GET /invoices?page=2&pageSize=25&sort=-createdAt&status=paid&client=42
```

```csharp
public class PagedRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 25;
    public string Sort { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

[HttpGet]
public IActionResult GetInvoices([FromQuery] PagedRequest request, [FromQuery] string status, [FromQuery] int? client)
{
    var result = _invoiceService.GetPaged(request, status, client);

    Response.Headers.Append("X-Total-Count", result.TotalCount.ToString());
    return Ok(result);
}
```

Include pagination metadata either in the body (`Items`, `TotalCount`, `TotalPages`) or in headers (`X-Total-Count`, `Link` header with `rel="next"`/`rel="prev"`) — pick one convention and stick to it across the whole API.

---

## 7. Filtering by Fields / Partial Responses

**Standard:** Let clients ask for only the fields they need, especially for large resources — reduces payload size on mobile/slow connections.

```
GET /clients/42?fields=id,name,email
```

```csharp
[HttpGet("{id:int}")]
public IActionResult GetById(int id, [FromQuery] string fields)
{
    var client = _clientService.GetById(id);
    if (client is null) return NotFound();

    if (string.IsNullOrEmpty(fields)) return Ok(client);

    var requestedFields = fields.Split(',', StringSplitOptions.TrimEntries);
    var shaped = ShapeObject(client, requestedFields); // reflection-based field projection
    return Ok(shaped);
}
```

---

## 8. Authentication & Authorization Standards

**Standard:** Use established schemes — OAuth 2.0 / OpenID Connect for delegated auth, JWT bearer tokens for stateless API auth. Never invent a custom auth header scheme.

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://auth.example.com";
        options.Audience = "api://clients-api";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
});

[Authorize(Policy = "RequireAdmin")]
[HttpDelete("{id:int}")]
public IActionResult Delete(int id) { /* ... */ }
```

Follow the principle of least privilege: scope tokens narrowly, expire them short, and never pass credentials in URL query strings (they end up in logs, browser history, and referrer headers).

---

## 9. Idempotency

**Standard:** GET, PUT, DELETE must be idempotent — calling them multiple times has the same effect as calling once. For POST (naturally non-idempotent, e.g. payments), support an `Idempotency-Key` header so retries don't double-create resources.

```csharp
[HttpPost("payments")]
public async Task<IActionResult> CreatePayment(
    [FromBody] PaymentRequest request,
    [FromHeader(Name = "Idempotency-Key")] string idempotencyKey)
{
    if (string.IsNullOrEmpty(idempotencyKey))
        return BadRequest("Idempotency-Key header is required for payment creation.");

    var existing = await _idempotencyStore.GetResultAsync(idempotencyKey);
    if (existing is not null)
        return Ok(existing); // safe retry — return the original result, don't re-charge

    var result = await _paymentService.ChargeAsync(request);
    await _idempotencyStore.SaveResultAsync(idempotencyKey, result);
    return Ok(result);
}
```

---

## 10. Rate Limiting

**Standard:** Protect the API from abuse and communicate limits clearly via headers.

```csharp
// Program.cs — built-in ASP.NET Core rate limiting (7+)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

app.UseRateLimiter();

app.MapControllers().RequireRateLimiting("api");
```

Return these headers so clients can self-throttle:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1712345678
```

---

## 11. HATEOAS (Hypermedia as the Engine of Application State)

**Standard:** Full REST maturity includes links in responses so clients can discover available actions rather than hardcoding URLs. Often skipped in practice (it adds complexity many teams don't need), but worth knowing — especially for public APIs meant to evolve independently of client code.

```json
{
  "id": 42,
  "name": "Tilenga Safaris",
  "_links": {
    "self": { "href": "/api/clients/42" },
    "invoices": { "href": "/api/clients/42/invoices" },
    "update": { "href": "/api/clients/42", "method": "PUT" }
  }
}
```

```csharp
public class ClientResponse
{
    public int Id { get; set; }
    public string Name { get; set; }
    public Dictionary<string, LinkInfo> Links { get; set; } = new();
}

public class LinkInfo
{
    public string Href { get; set; }
    public string Method { get; set; } = "GET";
}

var response = new ClientResponse { Id = client.Id, Name = client.Name };
response.Links["self"] = new LinkInfo { Href = $"/api/clients/{client.Id}" };
response.Links["invoices"] = new LinkInfo { Href = $"/api/clients/{client.Id}/invoices" };
```

---

## 12. Request/Response Body Conventions

**Standard:** Use `camelCase` JSON keys (the de facto web convention, even though C# properties are `PascalCase`), ISO 8601 for dates, and consistent envelope structure.

```csharp
// Program.cs — configure System.Text.Json to output camelCase automatically
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});
```

```json
{
  "clientId": 42,
  "createdAt": "2026-08-06T14:30:00Z",
  "totalAmount": 1250.00,
  "currency": "USD"
}
```

Always include currency/units alongside numeric amounts — never assume the client knows.

---

## 13. Input Validation

**Standard:** Validate at the API boundary and return `400`/`422` with field-level detail — never let bad input reach the domain layer silently.

```csharp
public class CreateClientRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; }

    [Required, EmailAddress]
    public string Email { get; set; }

    [RegularExpression("^[A-Z]{3}$")]
    public string PreferredCurrency { get; set; }
}

[HttpPost]
public IActionResult Create([FromBody] CreateClientRequest request)
{
    // [ApiController] attribute auto-returns 400 with ValidationProblemDetails
    // if ModelState is invalid — no need to check manually
    var client = _clientService.Create(request);
    return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
}
```

---

## 14. API Documentation (OpenAPI / Swagger)

**Standard:** Every API should ship a machine-readable OpenAPI spec, kept in sync with the actual code — not a stale wiki page.

```csharp
// Program.cs
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Clients API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

```csharp
/// <summary>Creates a new client.</summary>
/// <response code="201">Client created successfully.</response>
/// <response code="400">Validation failed.</response>
[ProducesResponseType(typeof(ClientResponse), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
[HttpPost]
public IActionResult Create([FromBody] CreateClientRequest request) { /* ... */ }
```

---

## 15. HTTPS, Security Headers, and CORS

**Standard:** TLS everywhere, no exceptions. Set security headers explicitly rather than relying on defaults, and scope CORS narrowly.

```csharp
// Program.cs
app.UseHttpsRedirection();
app.UseHsts();

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "no-referrer");
    await next();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedClients", policy =>
        policy.WithOrigins("https://app.example.com") // never "*" for authenticated APIs
              .AllowAnyMethod()
              .AllowAnyHeader());
});
```

---

## 16. Backward Compatibility Rules

**Standard:** Within a version, only make *additive*, non-breaking changes:

- ✅ Adding new optional fields to a response
- ✅ Adding new endpoints
- ✅ Adding new optional query parameters
- ❌ Removing or renaming a field
- ❌ Changing a field's type or meaning
- ❌ Making an optional parameter required
- ❌ Changing a success status code

Anything breaking → ship as a new API version, and deprecate the old one with a sunset header:

```csharp
Response.Headers.Append("Deprecation", "true");
Response.Headers.Append("Sunset", "Wed, 31 Dec 2026 23:59:59 GMT");
Response.Headers.Append("Link", "</api/v2/clients>; rel=\"successor-version\"");
```

---

## 17. Health Checks

**Standard:** Expose a standard, unauthenticated endpoint for load balancers/orchestrators to check service health.

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy())
    .AddSqlServer(connectionString, name: "database")
    .AddUrlGroup(new Uri("https://payments.example.com/health"), name: "payments-api");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        var result = new { status = report.Status.ToString(), checks = report.Entries.Select(e => new { e.Key, Status = e.Value.Status.ToString() }) };
        await context.Response.WriteAsJsonAsync(result);
    }
});
```

---

## Quick Reference Checklist

| # | Standard | Why it matters |
|---|---|---|
| 1 | Noun-based resource URLs | Predictable, discoverable API surface |
| 2 | Correct HTTP verbs | Clients and intermediaries (caches, proxies) behave correctly |
| 3 | Precise status codes | Clients can branch logic without parsing bodies |
| 4 | RFC 7807 error format | One error shape across the whole API |
| 5 | Explicit versioning | Change without breaking existing clients |
| 6 | Pagination | Prevents unbounded, slow responses |
| 7 | Field filtering | Smaller payloads where needed |
| 8 | OAuth2/JWT auth | Industry-standard, well-understood security model |
| 9 | Idempotency keys | Safe retries for non-idempotent operations |
| 10 | Rate limiting | Protects the API from abuse/overload |
| 11 | HATEOAS (optional) | Discoverable actions, looser client coupling |
| 12 | camelCase JSON, ISO 8601 dates | Matches web/JS client expectations |
| 13 | Input validation at the boundary | Keeps bad data out of the domain layer |
| 14 | OpenAPI/Swagger docs | Machine-readable, always-current documentation |
| 15 | HTTPS + security headers + scoped CORS | Baseline security hygiene |
| 16 | Backward-compatible changes within a version | Trust — clients don't break silently |
| 17 | Health check endpoint | Enables proper monitoring and orchestration |