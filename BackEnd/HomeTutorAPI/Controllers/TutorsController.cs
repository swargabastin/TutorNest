using AutoMapper;
using HomeTutorAPI.Data;
using HomeTutorAPI.DTOs;
using HomeTutorAPI.Models;
using HomeTutorAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HomeTutorAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TutorsController(
    ITutorRepository   tutorRepo,
    IUserRepository    userRepo,
    IMapper            mapper,
    AppDbContext        db,
    IConfiguration     cfg) : ControllerBase
{
    // ── GET /api/tutors/search ────────────────────────────────────────────────
    [HttpGet("search")]
    [ProducesResponseType(typeof(PagedResult<TutorListDto>), 200)]
    public async Task<IActionResult> Search([FromQuery] TutorSearchRequest req, CancellationToken ct)
    {
        var (items, total) = await tutorRepo.SearchAsync(
            req.Search, req.City, req.Subject, req.Level,
            req.Mode, req.MinRate, req.MaxRate, req.MinRating,
            req.VerifiedOnly, req.SortBy, req.Page, req.PageSize, ct);

        return Ok(new PagedResult<TutorListDto>(
            items.Select(mapper.Map<TutorListDto>).ToList(),
            total, req.Page, req.PageSize,
            (int)Math.Ceiling(total / (double)req.PageSize)));
    }

    // ── GET /api/tutors/{id} ──────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TutorDetailDto), 200)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var tutor = await tutorRepo.GetWithDetailsAsync(id, ct);
        if (tutor is null) return NotFound(new MessageResponse("Tutor not found.", false));
        return Ok(mapper.Map<TutorDetailDto>(tutor));
    }

    // ── GET /api/tutors/me ────────────────────────────────────────────────────
    [HttpGet("me")]
    [Authorize(Roles = "Tutor")]
    [ProducesResponseType(typeof(TutorDetailDto), 200)]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();
        var full = await tutorRepo.GetWithDetailsAsync(tutor.Id, ct);
        return Ok(mapper.Map<TutorDetailDto>(full!));
    }

    // ── PUT /api/tutors/me ────────────────────────────────────────────────────
    [HttpPut("me")]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateTutorProfileRequest req, CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        if (req.Qualification   is not null) tutor.Qualification   = req.Qualification;
        if (req.ExperienceYears is not null) tutor.ExperienceYears = req.ExperienceYears.Value;
        if (req.Bio             is not null) tutor.Bio             = req.Bio;
        if (req.TeachingMode    is not null) tutor.TeachingMode    = req.TeachingMode.Value;
        if (req.HourlyRate      is not null) tutor.HourlyRate      = req.HourlyRate.Value;
        if (req.TeachingLevels  is not null) tutor.TeachingLevels  = req.TeachingLevels.ToArray();
        if (req.Languages       is not null) tutor.Languages       = req.Languages.ToArray();
        if (req.ResponseTime    is not null) tutor.ResponseTime    = req.ResponseTime;
        tutor.UpdatedAt = DateTime.UtcNow;

        // Replace subjects
        if (req.SubjectIds is not null)
        {
            var existing = db.TutorSubjects.Where(ts => ts.TutorProfileId == tutor.Id);
            db.TutorSubjects.RemoveRange(existing);
            foreach (var sId in req.SubjectIds)
                await db.TutorSubjects.AddAsync(
                    new TutorSubject { TutorProfileId = tutor.Id, SubjectId = sId }, ct);
        }

        tutorRepo.Update(tutor);
        await tutorRepo.SaveChangesAsync(ct);
        return Ok(new MessageResponse("Profile updated successfully."));
    }

    // ── POST /api/tutors/me/profile-image ─────────────────────────────────────
    [HttpPost("me/profile-image")]
    [Authorize(Roles = "Tutor,Student")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadProfileImage(
        IFormFile file, CancellationToken ct)
    {
        if (file is not { Length: > 0 })
            return BadRequest(new MessageResponse("No file provided.", false));

        var ext = Path.GetExtension(file.FileName).ToLower();
        if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp"))
            return BadRequest(new MessageResponse("Only JPG/PNG/WEBP allowed.", false));

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new MessageResponse("File must be under 5 MB.", false));

        // Save to wwwroot/uploads (replace with Cloudinary in production)
        var dir      = Path.Combine("wwwroot", "uploads");
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var path     = Path.Combine(dir, fileName);

        await using var stream = System.IO.File.Create(path);
        await file.CopyToAsync(stream, ct);

        var url    = $"/uploads/{fileName}";
        var userId = GetUserId();
        var user   = await userRepo.GetByIdAsync(userId, ct);
        if (user is not null) { user.ProfileImage = url; await userRepo.SaveChangesAsync(ct); }

        return Ok(new { url });
    }

    // ── POST /api/tutors/me/verification-documents ─────────────────────────────
    [HttpPost("me/verification-documents")]
    [Authorize(Roles = "Tutor")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(TutorVerificationDocumentDto), 200)]
    public async Task<IActionResult> UploadVerificationDocument(
        IFormFile file, [FromForm] string docType, CancellationToken ct)
    {
        if (file is not { Length: > 0 })
            return BadRequest(new MessageResponse("No file provided.", false));

        if (!Enum.TryParse<VerificationDocType>(docType, true, out var parsedType))
            return BadRequest(new MessageResponse("Invalid document type.", false));

        var ext = Path.GetExtension(file.FileName).ToLower();
        if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp" or ".pdf"))
            return BadRequest(new MessageResponse("Only JPG/PNG/WEBP/PDF allowed.", false));

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new MessageResponse("File must be under 10 MB.", false));

        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        var dir = Path.Combine("wwwroot", "uploads", "verification-docs");
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var path     = Path.Combine(dir, fileName);

        await using (var stream = System.IO.File.Create(path))
            await file.CopyToAsync(stream, ct);

        var doc = new TutorVerificationDocument
        {
            TutorProfileId = tutor.Id,
            DocType        = parsedType,
            Status         = VerificationDocStatus.Pending,
            FileUrl        = $"/uploads/verification-docs/{fileName}"
        };

        await db.TutorVerificationDocuments.AddAsync(doc, ct);

        // Re-submitting resets IsVerified
        tutor.IsVerified = false;
        tutorRepo.Update(tutor);

        await db.SaveChangesAsync(ct);

        return Ok(mapper.Map<TutorVerificationDocumentDto>(doc));
    }

    // ── GET /api/tutors/me/verification-documents ──────────────────────────────
    [HttpGet("me/verification-documents")]
    [Authorize(Roles = "Tutor")]
    [ProducesResponseType(typeof(List<TutorVerificationDocumentDto>), 200)]
    public async Task<IActionResult> GetMyVerificationDocuments(CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        var docs = await db.TutorVerificationDocuments
            .Where(d => d.TutorProfileId == tutor.Id)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(ct);

        return Ok(docs.Select(mapper.Map<TutorVerificationDocumentDto>));
    }

    // ── GET /api/tutors/me/stats ───────────────────────────────────────────────
    [HttpGet("me/stats")]
    [Authorize(Roles = "Tutor")]
    [ProducesResponseType(typeof(TutorDashboardStatsDto), 200)]
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        var leads = await db.Enquiries
            .CountAsync(e => e.TutorProfileId == tutor.Id, ct);

        var now = DateTime.UtcNow;
        var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);
        var endOfWeek = startOfWeek.AddDays(7);

        var classesThisWeek = await db.Bookings
            .CountAsync(b => b.TutorProfileId == tutor.Id &&
                             b.Status == BookingStatus.Confirmed &&
                             b.StartTime >= startOfWeek &&
                             b.StartTime < endOfWeek, ct);

        return Ok(new TutorDashboardStatsDto(
            ProfileViews:    0,
            StudentLeads:    leads,
            ClassesThisWeek: classesThisWeek,
            Earnings:        tutor.EarningsBalance,
            CoinBalance:     tutor.CoinBalance,
            Rating:          tutor.RatingAvg,
            ReviewCount:     tutor.RatingCount));
    }

    // ── GET /api/tutors/me/enquiries ───────────────────────────────────────────
    [HttpGet("me/enquiries")]
    [Authorize(Roles = "Tutor")]
    [ProducesResponseType(typeof(List<EnquiryDto>), 200)]
    public async Task<IActionResult> GetEnquiries(CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        var enquiries = await db.Enquiries
            .Include(e => e.StudentProfile).ThenInclude(sp => sp.User)
            .Where(e => e.TutorProfileId == tutor.Id)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

        return Ok(enquiries.Select(mapper.Map<EnquiryDto>));
    }

    // ── PUT /api/tutors/me/availability ───────────────────────────────────────
    [HttpPut("me/availability")]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> SetAvailability(
        [FromBody] SetAvailabilityRequest req, CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        // Replace all
        var existing = db.Availabilities.Where(a => a.TutorProfileId == tutor.Id);
        db.Availabilities.RemoveRange(existing);

        foreach (var s in req.Slots)
            await db.Availabilities.AddAsync(new Availability
            {
                TutorProfileId = tutor.Id,
                DayOfWeek      = s.DayOfWeek,
                StartTime      = s.StartTime,
                EndTime        = s.EndTime
            }, ct);

        await db.SaveChangesAsync(ct);
        return Ok(new MessageResponse("Availability updated."));
    }

    // ── GET /api/tutors/me/wallet ──────────────────────────────────────────────
    [HttpGet("me/wallet")]
    [Authorize(Roles = "Tutor")]
    [ProducesResponseType(typeof(WalletSummaryDto), 200)]
    public async Task<IActionResult> GetWallet(CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        var txns = await db.CoinTransactions
            .Where(c => c.TutorProfileId == tutor.Id)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        return Ok(new WalletSummaryDto(tutor.CoinBalance, txns.Select(mapper.Map<CoinTransactionDto>).ToList()));
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
