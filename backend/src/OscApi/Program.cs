using Microsoft.AspNetCore.DataProtection;
using System.Threading.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Middleware;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Enables running as a Windows Service (no-op when launched as a console app),
// so the backend can be installed via scripts/install-backend-service.ps1.
builder.Host.UseWindowsService();

// Sentry error tracking (optional — skipped if DSN not configured)
var sentryDsn = builder.Configuration["Sentry:Dsn"];
if (!string.IsNullOrEmpty(sentryDsn))
{
    builder.WebHost.UseSentry(o =>
    {
        o.Dsn = sentryDsn;
        o.TracesSampleRate = 0.2;
        o.Environment = builder.Environment.EnvironmentName;
    });
}

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// Database
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connString))
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured. " +
        "Set it in appsettings.Development.json or via environment variable.");

var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(connString);
dataSourceBuilder.EnableDynamicJson();

// Connection pooling (critical for scale)
dataSourceBuilder.ConnectionStringBuilder.MaxPoolSize = 25;
dataSourceBuilder.ConnectionStringBuilder.MinPoolSize = 5;
dataSourceBuilder.ConnectionStringBuilder.ConnectionIdleLifetime = 300;

var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<OscDbContext>(options =>
    options.UseNpgsql(dataSource, npgOpt => npgOpt.EnableRetryOnFailure(
        maxRetryCount: 3,
        maxRetryDelay: TimeSpan.FromSeconds(5),
        errorCodesToAdd: null))
    .LogTo(Console.WriteLine, LogLevel.Information));

// Reverse proxy support: accept forwarded headers only from explicitly trusted
// proxy addresses. Trusting headers from every peer lets direct callers spoof
// client IPs and scheme, bypassing IP-based limits and corrupting audit records.
builder.Services.Configure<Microsoft.AspNetCore.Builder.ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor |
        Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
    foreach (var proxy in builder.Configuration["ForwardedHeaders:KnownProxies"]?
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) ?? [])
    {
        if (System.Net.IPAddress.TryParse(proxy, out var address))
            options.KnownProxies.Add(address);
        else
            throw new InvalidOperationException($"Invalid ForwardedHeaders:KnownProxies IP address: {proxy}");
    }
});

// CORS
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? ["http://localhost:3000"];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Core services
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<OscApi.Common.IGoogleTokenValidator, OscApi.Common.GoogleTokenValidator>();
builder.Services.AddSingleton<IPasswordService, PasswordService>();
builder.Services.AddSingleton<ITotpService, TotpService>();
// Email goes through a durable outbox (email_outbox table) delivered by a
// background worker, so a restart or deploy can't drop a pending email.
builder.Services.AddSingleton<OscApi.Common.EmailOutboxSignal>();
builder.Services.AddSingleton<OscApi.Common.IEmailOutbox, OscApi.Common.EmailOutbox>();
builder.Services.AddSingleton<IEmailService>(sp => new EmailService(
    sp.GetRequiredService<IConfiguration>(),
    sp.GetRequiredService<ILogger<EmailService>>(),
    sp.GetRequiredService<OscApi.Common.IEmailOutbox>()));
builder.Services.AddHostedService<OscApi.Common.EmailOutboxWorker>();
builder.Services.AddHostedService<OscApi.Services.SlaBreachWorker>();
builder.Services.AddScoped<IReferenceNumberGenerator, ReferenceNumberGenerator>();
builder.Services.AddHttpClient<IGroqClient, GroqClient>();
builder.Services.AddHttpClient<IRecaptchaService, RecaptchaService>();
builder.Services.AddHttpClient<IFlutterwaveClient, FlutterwaveClient>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// Redis cache (optional — falls back to in-memory if not configured).
// NOTE: Redis only backs IDistributedCache (e.g. chatbot session history). The
// rate limiter (ASP.NET's built-in partitions, below) is ALWAYS per-process,
// with or without Redis — N instances enforce N× each cap. Run a single backend
// instance; scaling out needs a distributed limiter (e.g. at the proxy/edge).
var redisConn = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConn))
{
    builder.Services.AddStackExchangeRedisCache(options => options.Configuration = redisConn);
}
else
{
    builder.Services.AddDistributedMemoryCache();
    Log.Warning(
        "Redis is not configured: the distributed cache (chatbot session history) is " +
        "in-memory and per-instance. Rate limiting is per-instance regardless of Redis.");
}

// Data Protection key ring (optional — falls back to an in-memory, per-process
// key if not configured). ASP.NET Core initializes this subsystem by default;
// without a persisted key, it regenerates one on every restart and logs a
// warning each time. Nothing in this app currently depends on it (auth uses a
// custom JWT cookie handler, not the built-in Data-Protection-backed one), but
// a self-hosted deployment restarts far more often than a managed platform's
// would, so we persist it properly rather than carry the warning indefinitely.
var keysDir = builder.Configuration["DataProtection:KeysDirectory"];
if (!string.IsNullOrEmpty(keysDir))
{
    Directory.CreateDirectory(keysDir);
    builder.Services.AddDataProtection()
        .SetApplicationName("OscApi")
        .PersistKeysToFileSystem(new DirectoryInfo(keysDir));
}
else
{
    Log.Warning(
        "DataProtection:KeysDirectory is not configured: keys are in-memory and " +
        "per-process, regenerated on every restart.");
}

// In-memory cache for application-level caching (settings, etc.)
builder.Services.AddMemoryCache();

// Business services
builder.Services.AddScoped<OscApi.Services.ITicketService, OscApi.Services.TicketService>();
builder.Services.AddScoped<OscApi.Services.IInvestorService, OscApi.Services.InvestorService>();
builder.Services.AddScoped<OscApi.Services.IContactService, OscApi.Services.ContactService>();
builder.Services.AddScoped<OscApi.Services.IBusinessRegistrationService, OscApi.Services.BusinessRegistrationService>();
builder.Services.AddScoped<OscApi.Services.IPaymentService, OscApi.Services.PaymentService>();
builder.Services.AddScoped<OscApi.Services.ISettingsService, OscApi.Services.SettingsService>();
builder.Services.AddScoped<OscApi.Services.IDashboardService, OscApi.Services.DashboardService>();
builder.Services.AddSingleton<OscApi.Services.IAnalyticsQueueService, OscApi.Services.AnalyticsQueueService>();
builder.Services.AddScoped<OscApi.Services.IS3UploadService, OscApi.Services.S3UploadService>();
builder.Services.AddScoped<OscApi.Services.IChatbotSessionService, OscApi.Services.ChatbotSessionService>();

// Validation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

// Authentication (cookie-based JWT)
builder.Services.AddAuthentication("OscCookie")
    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, OscApi.Middleware.CookieJwtAuthHandler>(
        "OscCookie", null);
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, OscApi.Common.MfaCompleteHandler>();
// Makes [Authorize]/policy failures (401/403) return RFC 7807 problem+json
// instead of an empty body — the one error path AddProblemDetails() alone
// doesn't cover, since authorization middleware runs before any controller
// action (and therefore before any Problem()/ValidationProblem() call).
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationMiddlewareResultHandler,
    OscApi.Middleware.ProblemDetailsAuthorizationMiddlewareResultHandler>();
builder.Services.AddAuthorization(options =>
{
    // Admin-level: full back-office access (Director General + system admins).
    // Mandatory MFA: a back-office session that hasn't completed TOTP enrolment
    // can still authenticate (see MfaCompleteRequirement) but cannot use this
    // policy — enrolment itself sits outside it, so it's never a dead end.
    options.AddPolicy(OscApi.Common.Roles.AdminOnlyPolicy,
        policy => policy.RequireRole(OscApi.Common.Roles.AdminLevel)
            .AddRequirements(new OscApi.Common.MfaCompleteRequirement()));
    // Staff: all back-office roles, including agency officers (who are then
    // scoped to their own agency inside each controller/query).
    options.AddPolicy(OscApi.Common.Roles.StaffPolicy,
        policy => policy.RequireRole(OscApi.Common.Roles.Staff)
            .AddRequirements(new OscApi.Common.MfaCompleteRequirement()));
});

// RFC 7807 problem+json for all client/server error responses (see
// ApiDesign.MD §4). ControllerBase.Problem()/ValidationProblem() and the
// built-in [ApiController] invalid-model-state handling both route through
// this — Program.cs is the single place the shape is defined.
builder.Services.AddProblemDetails();

// Controllers + Swagger
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "OSC Digital Tool API", Version = "v1",
        Description = "Uganda Investment Authority OneStop Centre backend API. Authenticated via osc-session cookie (JWT)." });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath)) c.IncludeXmlComments(xmlPath);
});

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;

    // Let throttled clients self-throttle (ApiDesign.MD §10) instead of
    // guessing when to retry.
    options.OnRejected = async (context, token) =>
    {
        var window = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter)
            ? retryAfter
            : TimeSpan.FromMinutes(1);
        context.HttpContext.Response.Headers.RetryAfter = ((int)window.TotalSeconds).ToString();
        await context.HttpContext.RequestServices.GetRequiredService<Microsoft.AspNetCore.Http.IProblemDetailsService>()
            .WriteAsync(new Microsoft.AspNetCore.Http.ProblemDetailsContext
            {
                HttpContext = context.HttpContext,
                ProblemDetails = new()
                {
                    Status = StatusCodes.Status429TooManyRequests,
                    Title = "Too many requests.",
                    Detail = "Rate limit exceeded. Retry after the interval in the Retry-After header.",
                    Instance = context.HttpContext.Request.Path,
                },
            });
    };

    options.AddPolicy("chatbot", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
            }));

    // Public endpoints are partitioned per IP — except for signed-in staff, who
    // are partitioned per user with a larger allowance. Officers in one office
    // share a NAT'd IP, so keying them by IP throttled them as a group (and
    // let investor traffic from the same network eat their budget).
    // Configurable so test hosts (one partition for everything) can raise them.
    var publicFormPermitLimit = builder.Configuration.GetValue("RateLimits:PublicFormPermitLimit", 10);
    var publicReadPermitLimit = builder.Configuration.GetValue("RateLimits:PublicReadPermitLimit", 60);
    var analyticsPermitLimit = builder.Configuration.GetValue("RateLimits:AnalyticsPermitLimit", 60);
    var staffPermitLimit = builder.Configuration.GetValue("RateLimits:StaffPermitLimit", 300);

    RateLimitPartition<string> PerClientSlidingWindow(HttpContext httpContext, string policy, int publicLimit)
    {
        var user = httpContext.User;
        var isStaff = OscApi.Common.Roles.Staff.Any(user.IsInRole);
        var userId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst("sub")?.Value;
        var (key, limit) = isStaff && userId is not null
            ? ($"{policy}:staff:{userId}", Math.Max(publicLimit, staffPermitLimit))
            : ($"{policy}:ip:{httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"}", publicLimit);
        return RateLimitPartition.GetSlidingWindowLimiter(key, _ => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = limit,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 4,
        });
    }

    // Public form submissions (writes): 10 per minute per IP.
    options.AddPolicy("public-form", ctx => PerClientSlidingWindow(ctx, "public-form", publicFormPermitLimit));

    // Public lookups (ticket / registration / payment / certificate reads, the
    // as-you-type name check, post-checkout payment polling): 60 per minute per
    // IP. Previously these shared the 10/min write bucket, so a single applicant
    // polling payment status could lock themselves out of submitting anything.
    options.AddPolicy("public-read", ctx => PerClientSlidingWindow(ctx, "public-read", publicReadPermitLimit));

    // Fire-and-forget usage analytics: its own bucket so page interactions
    // never consume the budget real form submissions depend on.
    options.AddPolicy("analytics", ctx => PerClientSlidingWindow(ctx, "analytics", analyticsPermitLimit));

    // Password reset: 3 per 15 minutes per IP
    options.AddPolicy("password-reset", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(15),
            }));

    // Credential endpoints (login / Google): slow down brute-force and
    // credential-stuffing. 10 attempts per 5 minutes per IP is generous for
    // humans but throttles automated guessing. Configurable so test hosts
    // (which funnel every request through one partition) can raise it.
    var loginPermitLimit = builder.Configuration.GetValue("RateLimits:LoginPermitLimit", 10);
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = loginPermitLimit,
                Window = TimeSpan.FromMinutes(5),
            }));
});

// SLA business-hours calendar: holidays gazetted each year (Eid al-Fitr,
// Eid al-Adha) as Sla:ExtraHolidays = ["2027-03-10", ...]. Fixed-date
// holidays and Easter are built into SlaCalculator.
OscApi.Common.SlaCalculator.ConfigureExtraHolidays(
    (builder.Configuration.GetSection("Sla:ExtraHolidays").Get<string[]>() ?? [])
        .Select(d => DateOnly.TryParse(d, out var date) ? date : (DateOnly?)null)
        .OfType<DateOnly>());

var app = builder.Build();

// Middleware pipeline
app.UseForwardedHeaders();
// Cookies authenticate browser requests. Require their Origin (or Referer) to
// match this API host or a configured frontend origin on every state-changing
// request; CORS alone does not stop a browser from sending a forged request.
if (!app.Environment.IsEnvironment("Testing"))
{
    var allowedBrowserOrigins = allowedOrigins
        .Select(origin => Uri.TryCreate(origin, UriKind.Absolute, out var parsed)
            ? parsed.GetLeftPart(UriPartial.Authority) : null)
        .Where(origin => origin is not null)
        .ToHashSet(StringComparer.OrdinalIgnoreCase);
    app.Use(async (context, next) =>
    {
        var method = context.Request.Method;
        var changesState = method != HttpMethods.Get && method != HttpMethods.Head &&
            method != HttpMethods.Options && method != HttpMethods.Trace;
        if (changesState && context.Request.Cookies.ContainsKey("osc-session"))
        {
            var source = context.Request.Headers["Origin"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(source) && context.Request.Headers["Referer"].Count > 0 &&
                Uri.TryCreate(context.Request.Headers["Referer"][0], UriKind.Absolute, out var referer))
                source = referer.GetLeftPart(UriPartial.Authority);

            var requestOrigin = $"{context.Request.Scheme}://{context.Request.Host}";
            if (string.IsNullOrWhiteSpace(source) ||
                (!string.Equals(source, requestOrigin, StringComparison.OrdinalIgnoreCase) &&
                 !allowedBrowserOrigins.Contains(source)))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return;
            }
        }

        await next();
    });
}
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<ValidationExceptionMiddleware>();

// HSTS only — no UseHttpsRedirection(). Kestrel only ever listens on plain
// HTTP here (ASPNETCORE_URLS=http://+:8080 in both render.yaml and
// docker-compose.test.yml); Render's edge terminates TLS and forwards
// X-Forwarded-Proto, which is already trusted above. An app-level HTTPS
// redirect would have no HTTPS port to redirect to and would break the
// plain-HTTP container healthcheck.
if (!app.Environment.IsDevelopment() && !app.Environment.IsEnvironment("Testing"))
{
    app.UseHsts();
}

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "no-referrer");
    await next();
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<OscApi.Middleware.AuditMiddleware>();
app.UseRateLimiter();
app.MapControllers();

// Auto-migrate and seed on startup. Always in Development; in other environments
// when RunMigrationsOnStartup is enabled (used by the self-hosted single-instance server).
if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("RunMigrationsOnStartup"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
    try
    {
        db.Database.Migrate();

        // Seed default admin if not exists. Never ship a static seed password.
        // Seed:AdminPassword must come from configuration (e.g. an environment
        // variable or user-secret), or seeding is skipped with a warning.
        if (!db.AdminUsers.Any(a => a.Email == "admin@uia.go.ug"))
        {
            var seedPassword = app.Configuration["Seed:AdminPassword"];

            if (string.IsNullOrWhiteSpace(seedPassword))
            {
                Log.Warning(
                    "Admin seed skipped: no admin@uia.go.ug exists and Seed:AdminPassword " +
                    "is not configured. Set it to seed the initial administrator.");
            }
            else
            {
                var pw = scope.ServiceProvider.GetRequiredService<IPasswordService>();
                db.AdminUsers.Add(new OscApi.Models.AdminUser
                {
                    Name = "OSC Administrator",
                    Email = "admin@uia.go.ug",
                    PasswordHash = pw.HashPassword(seedPassword),
                    Role = "admin",
                    IsActive = true,
                });
                db.SaveChanges();
                Log.Information("Default admin user seeded: admin@uia.go.ug");
            }
        }
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Database migration/seed failed; refusing to start without a verified schema");
        throw;
    }
}

app.Run();

// Exposed so the test project can spin up the app via WebApplicationFactory<Program>.
public partial class Program { }
