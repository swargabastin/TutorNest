using HomeTutorAPI.Services.Interfaces;

namespace HomeTutorAPI.Services;

/// <summary>
/// Saves uploads to wwwroot/uploads locally.
/// Swap out for CloudinaryImageService when ready for production.
/// </summary>
public class LocalImageService(
    IWebHostEnvironment env,
    ILogger<LocalImageService> logger) : IImageService
{
    private static readonly string[] Allowed = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB

    public async Task<string> UploadAsync(
        IFormFile file, string folder = "profiles", CancellationToken ct = default)
    {
        if (file is not { Length: > 0 })
            throw new ArgumentException("No file provided.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!Allowed.Contains(ext))
            throw new ArgumentException("Only JPG, PNG, or WEBP images are allowed.");

        if (file.Length > MaxBytes)
            throw new ArgumentException("File must be under 5 MB.");

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "uploads", folder);
        Directory.CreateDirectory(dir);

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(dir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream, ct);

        logger.LogInformation("Saved image: {Path}", filePath);
        return $"/uploads/{folder}/{fileName}";
    }
}

/* ── Cloudinary variant (uncomment + add CloudinaryDotNet package) ──────────
public class CloudinaryImageService(IConfiguration cfg) : IImageService
{
    private readonly Cloudinary _cloudinary = new(new Account(
        cfg["Cloudinary:CloudName"],
        cfg["Cloudinary:ApiKey"],
        cfg["Cloudinary:ApiSecret"]));

    public async Task<string> UploadAsync(IFormFile file, string folder = "profiles", CancellationToken ct = default)
    {
        await using var stream = file.OpenReadStream();
        var result = await _cloudinary.UploadAsync(new ImageUploadParams
        {
            File           = new FileDescription(file.FileName, stream),
            Folder         = $"hometutor/{folder}",
            Transformation = new Transformation().Width(400).Height(400).Crop("fill").Gravity("face")
        }, ct);
        return result.SecureUrl.ToString();
    }
}
── */
