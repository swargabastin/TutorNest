using System.Text;
using HomeTutorAPI.Data;
using HomeTutorAPI.Helpers;
using HomeTutorAPI.Repositories;
using HomeTutorAPI.Repositories.Interfaces;
using HomeTutorAPI.Services;
using HomeTutorAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace HomeTutorAPI.Extensions;

public static class ServiceExtensions
{
    // ── Helper: Safe Connection String Resolver ──────────────────────────────
    public static string? CleanConnectionString(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        raw = raw.Trim();
        if ((raw.StartsWith('"') && raw.EndsWith('"')) || (raw.StartsWith('\'') && raw.EndsWith('\'')))
        {
            raw = raw[1..^1].Trim();
        }
        return string.IsNullOrWhiteSpace(raw) ? null : raw;
    }

    public static string? GetDatabaseConnectionString(IConfiguration cfg, bool forMigration = false)
    {
        if (forMigration)
        {
            // For migrations/schema operations, prefer direct/unpooled connection to avoid PgBouncer transaction pooling limitations
            return CleanConnectionString(
                cfg["DATABASE_URL_UNPOOLED"]
                ?? Environment.GetEnvironmentVariable("DATABASE_URL_UNPOOLED")
                ?? cfg["DATABASE_URL"]
                ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? cfg.GetConnectionString("DefaultConnection")
            );
        }

        // For ordinary runtime queries, resolve cloud environment variable before falling back to local DefaultConnection
        return CleanConnectionString(
            cfg["DATABASE_URL"]
            ?? Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? cfg["DATABASE_URL_UNPOOLED"]
            ?? Environment.GetEnvironmentVariable("DATABASE_URL_UNPOOLED")
            ?? cfg.GetConnectionString("DefaultConnection")
        );
    }

    // ── Database ──────────────────────────────────────────────────────────────
    public static IServiceCollection AddDatabase(
        this IServiceCollection services, IConfiguration cfg)
    {
        var rawConnStr = GetDatabaseConnectionString(cfg, forMigration: false);

        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(
                rawConnStr,
                npg => npg.MigrationsAssembly("HomeTutorAPI"))
               .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));
        return services;
    }

    // ── JWT Auth ──────────────────────────────────────────────────────────────
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services, IConfiguration cfg)
    {
        var key = Encoding.UTF8.GetBytes(cfg["Jwt:SecretKey"]
            ?? throw new InvalidOperationException("Jwt:SecretKey is required."));

        services
            .AddAuthentication(opt =>
            {
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(opt =>
            {
                opt.RequireHttpsMetadata = false; // set true in production
                opt.SaveToken            = true;
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey         = new SymmetricSecurityKey(key),
                    ValidateIssuer           = true,
                    ValidIssuer              = cfg["Jwt:Issuer"],
                    ValidateAudience         = true,
                    ValidAudience            = cfg["Jwt:Audience"],
                    ValidateLifetime         = true,
                    ClockSkew                = TimeSpan.Zero
                };
            });

        services.AddAuthorization();
        return services;
    }

    // ── Swagger ───────────────────────────────────────────────────────────────
    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title       = "HomeTutor API",
                Version     = "v1",
                Description = "Backend API for the HomeTutor platform",
                Contact     = new OpenApiContact { Name = "HomeTutor Team" }
            });

            // JWT bearer in Swagger UI
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name         = "Authorization",
                Type         = SecuritySchemeType.Http,
                Scheme       = "bearer",
                BearerFormat = "JWT",
                In           = ParameterLocation.Header,
                Description  = "Enter your JWT token. Example: Bearer eyJhbGc..."
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {{
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                        { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                []
            }});
        });
        return services;
    }

    // ── CORS ──────────────────────────────────────────────────────────────────
    public static IServiceCollection AddCorsPolicy(
        this IServiceCollection services, IConfiguration cfg)
    {
        var rawOrigins = cfg["Cors:AllowedOrigins"] ?? Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");
        var origins = !string.IsNullOrWhiteSpace(rawOrigins)
            ? rawOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            : new[] { "http://localhost:3000", "http://localhost:3001" };

        services.AddCors(opt => opt.AddPolicy("Frontend", policy =>
            policy.WithOrigins(origins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials()));
        return services;
    }

    // ── Repositories ──────────────────────────────────────────────────────────
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository,            UserRepository>();
        services.AddScoped<ITutorRepository,           TutorRepository>();
        services.AddScoped<IStudentRepository,         StudentRepository>();
        services.AddScoped<IRequirementRepository,     RequirementRepository>();
        services.AddScoped<IEnquiryRepository,         EnquiryRepository>();
        services.AddScoped<IReviewRepository,          ReviewRepository>();
        services.AddScoped<IPaymentRepository,         PaymentRepository>();
        services.AddScoped<ICoinTransactionRepository, CoinTransactionRepository>();
        return services;
    }

    // ── Services ──────────────────────────────────────────────────────────────
    public static IServiceCollection AddAppServices(this IServiceCollection services)
    {
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IImageService, LocalImageService>();
        return services;
    }
}
