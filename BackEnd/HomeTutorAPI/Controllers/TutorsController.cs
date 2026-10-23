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
            req.VerifiedOnly, req.SortBy, req.Page, req.PageSize,
            req.Locality, req.Pincode, req.Boards, req.FreeDemoOnly, ct);

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
        if (req.Locality        is not null) tutor.Locality        = req.Locality;
        if (req.Pincode         is not null) tutor.Pincode         = req.Pincode;
        if (req.TravelRadiusKm  is not null) tutor.TravelRadiusKm  = req.TravelRadiusKm;
        if (req.Boards          is not null) tutor.Boards          = req.Boards.ToArray();
        if (req.OffersFreeDemo  is not null) tutor.OffersFreeDemo  = req.OffersFreeDemo.Value;

        // Phase 2: Video profile introduction
        if (req.IntroVideoUrl is not null)
        {
            var url = req.IntroVideoUrl.Trim();
            if (string.IsNullOrEmpty(url))
            {
                tutor.IntroVideoUrl = null;
            }
            else
            {
                if (!System.Text.RegularExpressions.Regex.IsMatch(url, @"^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|res\.cloudinary\.com)\/", System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                {
                    return BadRequest(new MessageResponse("IntroVideoUrl must be a valid YouTube, Vimeo, or Cloudinary URL.", false));
                }
                tutor.IntroVideoUrl = url;
            }
        }

        // Phase 3: WhatsApp lead alert preferences
        if (req.WhatsAppNotificationsEnabled is not null)
            tutor.WhatsAppNotificationsEnabled = req.WhatsAppNotificationsEnabled.Value;

        if (req.WhatsAppPhoneNumber is not null)
            tutor.WhatsAppPhoneNumber = req.WhatsAppPhoneNumber.Trim();

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

    // ── POST /api/tutors/me/unlock-lead/{enquiryId} ─────────────────────────────
    [HttpPost("me/unlock-lead/{enquiryId:guid}")]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> UnlockLead(Guid enquiryId, CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        const int leadCostCoins = 25;
        if (tutor.CoinBalance < leadCostCoins)
            return BadRequest(new MessageResponse($"Insufficient coin balance ({tutor.CoinBalance}). Unlocking requires {leadCostCoins} coins.", false));

        var enquiry = await db.Enquiries.FirstOrDefaultAsync(e => e.Id == enquiryId && e.TutorProfileId == tutor.Id, ct);
        if (enquiry is null) return NotFound(new MessageResponse("Enquiry lead not found.", false));

        // Check if already unlocked
        var alreadyUnlocked = await db.CoinTransactions.AnyAsync(
            t => t.TutorProfileId == tutor.Id && t.ReferenceId == enquiryId && t.Type == TransactionType.Debit, ct);
        if (alreadyUnlocked)
            return BadRequest(new MessageResponse("Lead already unlocked.", false));

        // Debit coins atomically
        tutor.CoinBalance -= leadCostCoins;
        var txn = new CoinTransaction
        {
            TutorProfileId = tutor.Id,
            Type           = TransactionType.Debit,
            Amount         = leadCostCoins,
            BalanceAfter   = tutor.CoinBalance,
            Description    = $"Unlocked student enquiry lead ({enquiry.Subject})",
            ReferenceId    = enquiryId
        };

        await db.CoinTransactions.AddAsync(txn, ct);
        await db.SaveChangesAsync(ct);

        return Ok(new MessageResponse($"Lead unlocked successfully. Debited {leadCostCoins} coins."));
    }

    // ── POST /api/tutors/me/coin-refunds ───────────────────────────────────────
    [HttpPost("me/coin-refunds")]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> RequestCoinRefund(
        [FromBody] CreateCoinRefundRequest req, CancellationToken ct)
    {
        if (req.CoinsRequested <= 0)
            return BadRequest(new MessageResponse("CoinsRequested must be greater than zero.", false));

        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        // 1. Verify coin transaction exists, belongs to tutor, and is debit
        var txn = await db.CoinTransactions
            .FirstOrDefaultAsync(t => t.Id == req.CoinTransactionId && t.TutorProfileId == tutor.Id, ct);
        if (txn is null)
            return NotFound(new MessageResponse("Coin transaction not found or does not belong to your account.", false));

        if (txn.Type != TransactionType.Debit)
            return BadRequest(new MessageResponse("Refunds can only be requested for debit transactions (spent coins).", false));

        if (req.CoinsRequested > txn.Amount)
            return BadRequest(new MessageResponse($"Cannot request more coins ({req.CoinsRequested}) than debited ({txn.Amount}).", false));

        // 2. Prevent duplicate active refund requests for the same transaction
        var existingRequest = await db.CoinRefundRequests
            .AnyAsync(r => r.CoinTransactionId == req.CoinTransactionId &&
                           (r.Status == CoinRefundStatus.Pending || r.Status == CoinRefundStatus.Approved), ct);
        if (existingRequest)
            return BadRequest(new MessageResponse("A refund request is already pending or approved for this transaction.", false));

        var refund = new CoinRefundRequest
        {
            TutorProfileId    = tutor.Id,
            CoinTransactionId = req.CoinTransactionId,
            ReferenceId       = req.ReferenceId ?? txn.ReferenceId,
            CoinsRequested    = req.CoinsRequested,
            Reason            = req.Reason,
            Explanation       = req.Explanation.Trim(),
            Status            = CoinRefundStatus.Pending,
            CreatedAt         = DateTime.UtcNow
        };

        await db.CoinRefundRequests.AddAsync(refund, ct);
        await db.SaveChangesAsync(ct);

        return Ok(mapper.Map<CoinRefundRequestDto>(refund));
    }

    // ── GET /api/tutors/me/coin-refunds ────────────────────────────────────────
    [HttpGet("me/coin-refunds")]
    [Authorize(Roles = "Tutor")]
    [ProducesResponseType(typeof(List<CoinRefundRequestDto>), 200)]
    public async Task<IActionResult> GetMyCoinRefunds(CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor  = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        var requests = await db.CoinRefundRequests
            .Include(r => r.TutorProfile).ThenInclude(t => t.User)
            .Where(r => r.TutorProfileId == tutor.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return Ok(requests.Select(mapper.Map<CoinRefundRequestDto>));
    }

    // ── GET /api/tutors/me/verification-documents/{id}/file ─────────────────────
    [HttpGet("me/verification-documents/{id:guid}/file")]
    [Authorize(Roles = "Tutor")]
    public async Task<IActionResult> GetMyVerificationDocumentFile(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var tutor = await tutorRepo.GetByUserIdAsync(userId, ct);
        if (tutor is null) return NotFound();

        var doc = await db.TutorVerificationDocuments.FirstOrDefaultAsync(d => d.Id == id && d.TutorProfileId == tutor.Id, ct);
        if (doc is null) return NotFound();

        var localPath = Path.Combine("wwwroot", doc.FileUrl.TrimStart('/'));
        if (!System.IO.File.Exists(localPath)) return NotFound(new MessageResponse("File not found on disk.", false));

        var ext = Path.GetExtension(localPath).ToLower();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => "image/jpeg"
        };
        return PhysicalFile(Path.GetFullPath(localPath), contentType);
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
