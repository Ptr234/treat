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
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<OscDbContext>(options => options.UseNpgsql(dataSource));

// CORS
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?.Split(',') ?? ["http://localhost:3000"];
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
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<PasswordService>();
builder.Services.AddSingleton<TotpService>();
builder.Services.AddSingleton<EmailService>();
builder.Services.AddScoped<ReferenceNumberGenerator>();
builder.Services.AddHttpClient<GroqClient>();
builder.Services.AddHttpClient<RecaptchaService>();

// Redis cache (optional — falls back to in-memory if not configured).
// NOTE: the rate limiter (below) and this cache are per-process. They are only
// safe on a single backend instance. Before scaling horizontally, configure the
// "Redis" connection string so limits/cache are shared across instances —
// otherwise each instance enforces its own limits (N instances ⇒ N× the cap).
var redisConn = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConn))
{
    builder.Services.AddStackExchangeRedisCache(options => options.Configuration = redisConn);
}
else
{
    builder.Services.AddDistributedMemoryCache();
    Log.Warning(
        "Redis is not configured: distributed cache and rate limiting are in-memory " +
        "and per-instance. Do NOT run more than one backend instance in this mode.");
}

// Business services
builder.Services.AddScoped<OscApi.Services.ITicketService, OscApi.Services.TicketService>();
builder.Services.AddScoped<OscApi.Services.IInvestorService, OscApi.Services.InvestorService>();
builder.Services.AddScoped<OscApi.Services.IContactService, OscApi.Services.ContactService>();
builder.Services.AddScoped<OscApi.Services.ISettingsService, OscApi.Services.SettingsService>();

// Validation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

// Authentication (cookie-based JWT)
builder.Services.AddAuthentication("OscCookie")
    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, OscApi.Middleware.CookieJwtAuthHandler>(
        "OscCookie", null);
builder.Services.AddAuthorization(options =>
{
    // Admin-level: full back-office access (Director General + system admins).
    options.AddPolicy(OscApi.Common.Roles.AdminOnlyPolicy,
        policy => policy.RequireRole(OscApi.Common.Roles.AdminLevel));
    // Staff: all back-office roles, including agency officers (who are then
    // scoped to their own agency inside each controller/query).
    options.AddPolicy(OscApi.Common.Roles.StaffPolicy,
        policy => policy.RequireRole(OscApi.Common.Roles.Staff));
});

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

    options.AddPolicy("chatbot", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
            }));

    // Public form submissions: 10 per minute per IP
    options.AddPolicy("public-form", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
            }));

    // Password reset: 3 per 15 minutes per IP
    options.AddPolicy("password-reset", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(15),
            }));
});

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<ValidationExceptionMiddleware>();

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

        // Seed default admin if not exists. Never ship a static production
        // password: in Development a convenience default is used, but outside
        // Development the password MUST come from configuration (Seed:AdminPassword,
        // e.g. an env var / user-secret) or seeding is skipped with a warning.
        if (!db.AdminUsers.Any(a => a.Email == "admin@uia.go.ug"))
        {
            var seedPassword = app.Environment.IsDevelopment()
                ? (app.Configuration["Seed:AdminPassword"] ?? "Admin@2026!")
                : app.Configuration["Seed:AdminPassword"];

            if (string.IsNullOrWhiteSpace(seedPassword))
            {
                Log.Warning(
                    "Admin seed skipped: no admin@uia.go.ug exists and Seed:AdminPassword " +
                    "is not configured. Set it to seed the initial administrator.");
            }
            else
            {
                var pw = scope.ServiceProvider.GetRequiredService<PasswordService>();
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
        Log.Warning(ex, "Database migration/seed skipped");
    }
}

app.Run();

// Exposed so the test project can spin up the app via WebApplicationFactory<Program>.
public partial class Program { }
