using HomeTutorAPI.Data;
using HomeTutorAPI.Extensions;
using HomeTutorAPI.Helpers;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// ── Bind to cloud host port if PORT environment variable is set (Render, Railway, etc.)
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port) && int.TryParse(port, out _))
{
    builder.WebHost.UseUrls($"http://+:{port}");
}

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddRepositories();
builder.Services.AddAppServices();
builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwagger();
builder.Services.AddHttpContextAccessor();

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Trust Azure/reverse proxy headers ──────────────────────────────────────────
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// ── Exception middleware (must be first) ──────────────────────────────────────
app.UseMiddleware<ExceptionMiddleware>();

// ── Swagger UI ────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeTutor API v1");
        c.RoutePrefix          = "swagger";
        c.DocumentTitle        = "HomeTutor API";
        c.DefaultModelsExpandDepth(-1);
    });
}

// ── Static files (profile images saved locally) ───────────────────────────────
app.UseStaticFiles();

// ── Pipeline ──────────────────────────────────────────────────────────────────
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Health check endpoint (used by deploy workflow & uptime monitors) ────────
app.MapGet("/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

// ── Auto-migrate + seed on startup ────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db     = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var (migrationConnStr, migSource, migConverted) = ServiceExtensions.ResolveDatabaseConnection(app.Configuration, forMigration: true);
        var (runtimeConnStr, runSource, runConverted)   = ServiceExtensions.ResolveDatabaseConnection(app.Configuration, forMigration: false);

        if (!string.IsNullOrEmpty(runtimeConnStr))
        {
            try
            {
                var csb = new Npgsql.NpgsqlConnectionStringBuilder(runtimeConnStr);
                var host = csb.Host ?? string.Empty;
                var hostType = host.Contains(".neon.tech", StringComparison.OrdinalIgnoreCase)
                    ? (host.Contains("-pooler") ? "Neon Pooled" : "Neon Direct")
                    : (host == "localhost" || host == "127.0.0.1" ? "Localhost" : "Remote Server");

                logger.LogInformation("Database configured from {Source}. URI conversion applied: {Converted}. Target: {Target}, Port: {Port}, SSL: {SslMode}",
                    runSource, runConverted, hostType, csb.Port, csb.SslMode);
            }
            catch
            {
                logger.LogInformation("Database configured from {Source}. URI conversion applied: {Converted}.", runSource, runConverted);
            }
        }

        if (!string.IsNullOrEmpty(migrationConnStr) && migrationConnStr != db.Database.GetConnectionString())
        {
            db.Database.SetConnectionString(migrationConnStr);
        }

        await db.Database.MigrateAsync();
        logger.LogInformation("Database migrations applied.");

        if (!string.IsNullOrEmpty(runtimeConnStr) && db.Database.GetConnectionString() != runtimeConnStr)
        {
            db.Database.SetConnectionString(runtimeConnStr);
        }

        if (!await db.Users.AnyAsync(u => u.Role == HomeTutorAPI.Models.UserRole.Admin))
        {
            var adminUser = new HomeTutorAPI.Models.User
            {
                FullName = "Admin User",
                Email = "admin@hometutor.in",
                Phone = "9000000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = HomeTutorAPI.Models.UserRole.Admin,
                IsActive = true,
                EmailVerified = true
            };
            await db.Users.AddAsync(adminUser);
            await db.SaveChangesAsync();
            logger.LogInformation("Default Admin user seeded: admin@hometutor.in / Admin@123");
        }

        // ── Seed Cities / Locations if not present ────────────────────────────────────
        string[] allCities =
        [
            "Ahmedabad", "Alappuzha", "Bangalore", "Bhopal", "Bhubaneswar", "Chandigarh",
            "Chennai", "Coimbatore", "Dehradun", "Delhi", "Faridabad", "Ghaziabad",
            "Gurgaon", "Guwahati", "Hyderabad", "Indore", "Jaipur", "Kannur", "Kochi",
            "Kollam", "Kolkata", "Kottayam", "Kozhikode", "Lucknow", "Madurai", "Malappuram",
            "Mumbai", "Mysore", "Nagpur", "Noida", "Palakkad", "Patna", "Pune", "Raipur",
            "Ranchi", "Salem", "Surat", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli",
            "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam"
        ];

        // Clean up any Ernakulam entries so Kochi is used exclusively
        var ernakulamEntries = await db.Locations
            .Where(l => l.City.StartsWith("Ernakulam", StringComparison.OrdinalIgnoreCase))
            .ToListAsync();
        if (ernakulamEntries.Count > 0)
        {
            db.Locations.RemoveRange(ernakulamEntries);
            await db.SaveChangesAsync();
            logger.LogInformation("Removed {Count} Ernakulam entries in favor of Kochi.", ernakulamEntries.Count);
        }

        var existingCities = await db.Locations.Select(l => l.City).ToListAsync();
        var missingCities = allCities.Where(c => !existingCities.Contains(c, StringComparer.OrdinalIgnoreCase)).ToList();
        if (missingCities.Count > 0)
        {
            var newLocations = missingCities.Select(c => new HomeTutorAPI.Models.Location
            {
                City = c,
                State = "India",
                Country = "India",
                IsActive = true
            });
            await db.Locations.AddRangeAsync(newLocations);
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} additional cities including Kochi.", missingCities.Count);
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Migration failed.");
    }
}

app.Run();
