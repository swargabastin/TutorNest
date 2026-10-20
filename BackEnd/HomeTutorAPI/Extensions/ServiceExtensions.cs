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
using Npgsql;

namespace HomeTutorAPI.Extensions;

public static class ServiceExtensions
{
    private static readonly char[] InvisibleAndWhitespaceChars =
    [
        ' ', '\t', '\r', '\n', '\v', '\f',
        '\uFEFF', // Byte Order Mark
        '\u200B', // Zero-Width Space
        '\u200C', // Zero-Width Non-Joiner
        '\u200D', // Zero-Width Joiner
        '\u00A0'  // Non-Breaking Space
    ];

    // ── Helper: Safe Connection String Resolver ──────────────────────────────
    public static (string? Cleaned, bool IsConverted) CleanConnectionStringWithStatus(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return (null, false);

        raw = raw.Trim(InvisibleAndWhitespaceChars);

        // Remove matching outer single quotes, double quotes, or backticks iteratively
        while (raw.Length > 1)
        {
            if ((raw.StartsWith('"') && raw.EndsWith('"')) ||
                (raw.StartsWith('\'') && raw.EndsWith('\'')) ||
                (raw.StartsWith('`') && raw.EndsWith('`')))
            {
                raw = raw[1..^1].Trim(InvisibleAndWhitespaceChars);
            }
            else
            {
                break;
            }
        }

        if (string.IsNullOrWhiteSpace(raw)) return (null, false);

        // Strip leading "psql " command only if the remainder is a valid postgres URI
        if (raw.StartsWith("psql ", StringComparison.OrdinalIgnoreCase))
        {
            var afterPsql = raw[5..].Trim(InvisibleAndWhitespaceChars);
            if ((afterPsql.StartsWith('\'') && afterPsql.EndsWith('\'')) ||
                (afterPsql.StartsWith('"') && afterPsql.EndsWith('"')) ||
                (afterPsql.StartsWith('`') && afterPsql.EndsWith('`')))
            {
                afterPsql = afterPsql[1..^1].Trim(InvisibleAndWhitespaceChars);
            }

            if (afterPsql.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                afterPsql.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            {
                raw = afterPsql;
            }
        }

        // Recognize known variable assignment prefixes if present
        string[] knownPrefixes = ["DATABASE_URL=", "DATABASE_URL_UNPOOLED=", "ConnectionStrings__DefaultConnection=", "DefaultConnection="];
        foreach (var prefix in knownPrefixes)
        {
            if (raw.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                var afterPrefix = raw[prefix.Length..].Trim(InvisibleAndWhitespaceChars);
                if ((afterPrefix.StartsWith('\'') && afterPrefix.EndsWith('\'')) ||
                    (afterPrefix.StartsWith('"') && afterPrefix.EndsWith('"')) ||
                    (afterPrefix.StartsWith('`') && afterPrefix.EndsWith('`')))
                {
                    afterPrefix = afterPrefix[1..^1].Trim(InvisibleAndWhitespaceChars);
                }
                raw = afterPrefix;
                break;
            }
        }

        // If it starts with postgresql:// or postgres://, convert to standard Npgsql key-value format
        if (raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return (ConvertPostgreSqlUriToConnectionString(raw), true);
        }

        // If it's a standard semicolon-separated format, ensure it has '=' key-value structure
        if (raw.Contains('='))
        {
            return (raw, false);
        }

        // Reject unrecognized or malformed input with a clear, non-sensitive exception
        throw new FormatException("The database connection string format is not recognized or is malformed.");
    }

    public static string? CleanConnectionString(string? raw)
    {
        return CleanConnectionStringWithStatus(raw).Cleaned;
    }

    public static string ConvertPostgreSqlUriToConnectionString(string uriString)
    {
        if (string.IsNullOrWhiteSpace(uriString))
            throw new FormatException("The PostgreSQL connection URI cannot be empty.");

        Uri uri;
        try
        {
            uri = new Uri(uriString);
        }
        catch (Exception ex)
        {
            throw new FormatException("The provided PostgreSQL connection URI is invalid or malformed.", ex);
        }

        if (!uri.Scheme.Equals("postgres", StringComparison.OrdinalIgnoreCase) &&
            !uri.Scheme.Equals("postgresql", StringComparison.OrdinalIgnoreCase))
        {
            throw new FormatException("The provided connection URI does not use a supported PostgreSQL scheme (postgres:// or postgresql://).");
        }

        if (string.IsNullOrWhiteSpace(uri.Host))
        {
            throw new FormatException("The provided PostgreSQL connection URI is missing a valid host.");
        }

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            SslMode = SslMode.Require
        };

        var dbPath = uri.AbsolutePath.TrimStart('/');
        if (!string.IsNullOrWhiteSpace(dbPath))
        {
            builder.Database = Uri.UnescapeDataString(dbPath);
        }

        if (!string.IsNullOrEmpty(uri.UserInfo))
        {
            var parts = uri.UserInfo.Split(':', 2);
            if (parts.Length > 0 && !string.IsNullOrEmpty(parts[0]))
            {
                builder.Username = Uri.UnescapeDataString(parts[0]);
            }
            if (parts.Length > 1)
            {
                builder.Password = Uri.UnescapeDataString(parts[1]);
            }
        }

        if (!string.IsNullOrEmpty(uri.Query))
        {
            var query = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries);
            foreach (var param in query)
            {
                var kv = param.Split('=', 2);
                if (kv.Length == 0 || string.IsNullOrWhiteSpace(kv[0])) continue;

                var key = kv[0].Trim().ToLowerInvariant();
                var val = kv.Length > 1 ? Uri.UnescapeDataString(kv[1].Trim()) : string.Empty;

                switch (key)
                {
                    case "sslmode":
                        if (Enum.TryParse<SslMode>(val, ignoreCase: true, out var ssl))
                        {
                            builder.SslMode = ssl;
                        }
                        break;

                    case "pooling":
                        if (bool.TryParse(val, out var pooling))
                        {
                            builder.Pooling = pooling;
                        }
                        break;

                    case "channel_binding":
                        if (Enum.TryParse<ChannelBinding>(val, ignoreCase: true, out var cb))
                        {
                            builder.ChannelBinding = cb;
                        }
                        break;

                    case "timeout":
                    case "connect_timeout":
                        if (int.TryParse(val, out var timeout))
                        {
                            builder.Timeout = timeout;
                        }
                        break;

                    case "command_timeout":
                        if (int.TryParse(val, out var cmdTimeout))
                        {
                            builder.CommandTimeout = cmdTimeout;
                        }
                        break;

                    case "application_name":
                        builder.ApplicationName = val;
                        break;

                    case "search_path":
                    case "searchpath":
                        builder.SearchPath = val;
                        break;
                }
            }
        }

        return builder.ConnectionString;
    }

    public static (string? ConnectionString, string SourceName, bool IsConverted) ResolveDatabaseConnection(IConfiguration cfg, bool forMigration = false)
    {
        string? raw = null;
        string sourceName = "None";

        if (forMigration)
        {
            if (!string.IsNullOrWhiteSpace(cfg["DATABASE_URL_UNPOOLED"]))
            {
                raw = cfg["DATABASE_URL_UNPOOLED"];
                sourceName = "DATABASE_URL_UNPOOLED (cfg)";
            }
            else if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("DATABASE_URL_UNPOOLED")))
            {
                raw = Environment.GetEnvironmentVariable("DATABASE_URL_UNPOOLED");
                sourceName = "DATABASE_URL_UNPOOLED (env)";
            }
            else if (!string.IsNullOrWhiteSpace(cfg["DATABASE_URL"]))
            {
                raw = cfg["DATABASE_URL"];
                sourceName = "DATABASE_URL (cfg)";
            }
            else if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("DATABASE_URL")))
            {
                raw = Environment.GetEnvironmentVariable("DATABASE_URL");
                sourceName = "DATABASE_URL (env)";
            }
            else
            {
                raw = cfg.GetConnectionString("DefaultConnection");
                sourceName = "DefaultConnection";
            }
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(cfg["DATABASE_URL"]))
            {
                raw = cfg["DATABASE_URL"];
                sourceName = "DATABASE_URL (cfg)";
            }
            else if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("DATABASE_URL")))
            {
                raw = Environment.GetEnvironmentVariable("DATABASE_URL");
                sourceName = "DATABASE_URL (env)";
            }
            else if (!string.IsNullOrWhiteSpace(cfg["DATABASE_URL_UNPOOLED"]))
            {
                raw = cfg["DATABASE_URL_UNPOOLED"];
                sourceName = "DATABASE_URL_UNPOOLED (cfg)";
            }
            else if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("DATABASE_URL_UNPOOLED")))
            {
                raw = Environment.GetEnvironmentVariable("DATABASE_URL_UNPOOLED");
                sourceName = "DATABASE_URL_UNPOOLED (env)";
            }
            else
            {
                raw = cfg.GetConnectionString("DefaultConnection");
                sourceName = "DefaultConnection";
            }
        }

        var (cleaned, isConverted) = CleanConnectionStringWithStatus(raw);
        return (cleaned, sourceName, isConverted);
    }

    public static string? GetDatabaseConnectionString(IConfiguration cfg, bool forMigration = false)
    {
        return ResolveDatabaseConnection(cfg, forMigration).ConnectionString;
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
