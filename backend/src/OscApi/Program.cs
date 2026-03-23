using System.Threading.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using OscApi.Common;
using OscApi.Data;
using OscApi.Middleware;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddSingleton<EmailService>();
builder.Services.AddScoped<ReferenceNumberGenerator>();
builder.Services.AddHttpClient<GroqClient>();
builder.Services.AddHttpClient<RecaptchaService>();

// Redis cache (optional — falls back to in-memory if not configured)
var redisConn = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConn))
{
    builder.Services.AddStackExchangeRedisCache(options => options.Configuration = redisConn);
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

// Business services
builder.Services.AddScoped<OscApi.Services.ITicketService, OscApi.Services.TicketService>();
builder.Services.AddScoped<OscApi.Services.IInvestorService, OscApi.Services.InvestorService>();
builder.Services.AddScoped<OscApi.Services.IContactService, OscApi.Services.ContactService>();

// Validation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

// Authentication (cookie-based JWT)
builder.Services.AddAuthentication("OscCookie")
    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, OscApi.Middleware.CookieJwtAuthHandler>(
        "OscCookie", null);
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
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
app.UseRateLimiter();
app.MapControllers();

// Auto-migrate and seed in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<OscDbContext>();
    try
    {
        db.Database.Migrate();

        // Seed default admin if not exists
        if (!db.AdminUsers.Any(a => a.Email == "admin@uia.go.ug"))
        {
            var pw = scope.ServiceProvider.GetRequiredService<PasswordService>();
            db.AdminUsers.Add(new OscApi.Models.AdminUser
            {
                Name = "OSC Administrator",
                Email = "admin@uia.go.ug",
                PasswordHash = pw.HashPassword("Admin@2026!"),
                Role = "admin",
                IsActive = true,
            });
            db.SaveChanges();
            Log.Information("Default admin user seeded: admin@uia.go.ug");
        }
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Database migration/seed skipped");
    }
}

app.Run();
