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
[Authorize(Roles = "Student")]
public class StudentsController(
    IStudentRepository studentRepo,
    ITutorRepository   tutorRepo,
    IMapper            mapper,
    AppDbContext        db) : ControllerBase
{
    // ── GET /api/students/me ──────────────────────────────────────────────────
    [HttpGet("me")]
    [ProducesResponseType(typeof(StudentProfileDto), 200)]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var profile = await studentRepo.GetWithRequirementsAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        return Ok(new StudentProfileDto(
            profile.Id, profile.UserId,
            profile.User.FullName, profile.User.ProfileImage,
            profile.User.Email, profile.User.Phone, profile.User.City,
            profile.CreatedAt, profile.CoinBalance,
            profile.Requirements.Select(mapper.Map<RequirementDto>).ToList()));
    }

    // ── GET /api/students/me/stats ────────────────────────────────────────────
    [HttpGet("me/stats")]
    [ProducesResponseType(typeof(StudentDashboardStatsDto), 200)]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var profile = await studentRepo.GetByUserIdAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        var activeReqs = await db.TuitionRequirements
            .CountAsync(r => r.StudentProfileId == profile.Id &&
                             r.Status == RequirementStatus.Active, ct);

        var enquiries = await db.Enquiries
            .CountAsync(e => e.StudentProfileId == profile.Id, ct);

        return Ok(new StudentDashboardStatsDto(
            ActiveRequirements: activeReqs,
            TutorResponses:     0,  // extend with response tracking
            CoinBalance:        profile.CoinBalance,
            TotalEnquiries:     enquiries));
    }

    // ── POST /api/students/me/requirements ────────────────────────────────────
    [HttpPost("me/requirements")]
    [ProducesResponseType(typeof(RequirementDto), 201)]
    public async Task<IActionResult> PostRequirement(
        [FromBody] PostRequirementRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var profile = await studentRepo.GetByUserIdAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        if (!Enum.TryParse<RequirementMode>(req.Mode, true, out var mode))
            return BadRequest(new MessageResponse("Invalid mode value.", false));

        var requirement = new TuitionRequirement
        {
            StudentProfileId = profile.Id,
            Subject          = req.Subject,
            Level            = req.Level,
            City             = req.City,
            Mode             = mode,
            Budget           = req.Budget,
            FrequencyPerWeek = req.FrequencyPerWeek,
            Description      = req.Description,
        };

        await db.TuitionRequirements.AddAsync(requirement, ct);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetMyProfile), null, mapper.Map<RequirementDto>(requirement));
    }

    // ── GET /api/students/me/requirements ─────────────────────────────────────
    [HttpGet("me/requirements")]
    [ProducesResponseType(typeof(List<RequirementDto>), 200)]
    public async Task<IActionResult> GetRequirements(CancellationToken ct)
    {
        var profile = await studentRepo.GetByUserIdAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        var reqs = await db.TuitionRequirements
            .Where(r => r.StudentProfileId == profile.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return Ok(reqs.Select(mapper.Map<RequirementDto>));
    }

    // ── DELETE /api/students/me/requirements/{id} ─────────────────────────────
    [HttpDelete("me/requirements/{id:guid}")]
    public async Task<IActionResult> CloseRequirement(Guid id, CancellationToken ct)
    {
        var profile = await studentRepo.GetByUserIdAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        var req = await db.TuitionRequirements
            .FirstOrDefaultAsync(r => r.Id == id && r.StudentProfileId == profile.Id, ct);
        if (req is null) return NotFound(new MessageResponse("Requirement not found.", false));

        req.Status    = RequirementStatus.Closed;
        req.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(new MessageResponse("Requirement closed."));
    }

    // ── POST /api/students/me/enquiries ───────────────────────────────────────
    [HttpPost("me/enquiries")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    public async Task<IActionResult> SendEnquiry(
        [FromBody] SendEnquiryRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var profile = await studentRepo.GetByUserIdAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        var tutor = await tutorRepo.GetByIdAsync(req.TutorProfileId, ct);
        if (tutor is null) return NotFound(new MessageResponse("Tutor not found.", false));

        var enquiry = new Enquiry
        {
            StudentProfileId = profile.Id,
            TutorProfileId   = req.TutorProfileId,
            Subject          = req.Subject,
            Level            = req.Level,
            Message          = req.Message,
        };

        await db.Enquiries.AddAsync(enquiry, ct);
        await db.SaveChangesAsync(ct);

        return Ok(new MessageResponse("Enquiry sent successfully."));
    }

    // ── GET /api/students/me/enquiries ────────────────────────────────────────
    [HttpGet("me/enquiries")]
    [ProducesResponseType(typeof(List<EnquiryDto>), 200)]
    public async Task<IActionResult> GetEnquiries(CancellationToken ct)
    {
        var profile = await studentRepo.GetByUserIdAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        var enquiries = await db.Enquiries
            .Include(e => e.TutorProfile).ThenInclude(tp => tp.User)
            .Where(e => e.StudentProfileId == profile.Id)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);

        return Ok(enquiries.Select(mapper.Map<EnquiryDto>));
    }

    // ── POST /api/students/me/reviews ─────────────────────────────────────────
    [HttpPost("me/reviews")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    public async Task<IActionResult> SubmitReview(
        [FromBody] SubmitReviewRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var profile = await studentRepo.GetByUserIdAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        var alreadyReviewed = await db.Reviews.AnyAsync(
            r => r.StudentProfileId == profile.Id && r.TutorProfileId == req.TutorProfileId, ct);
        if (alreadyReviewed)
            return Conflict(new MessageResponse("You have already reviewed this tutor.", false));

        var review = new Review
        {
            StudentProfileId = profile.Id,
            TutorProfileId   = req.TutorProfileId,
            Rating           = req.Rating,
            ReviewText       = req.ReviewText,
        };

        await db.Reviews.AddAsync(review, ct);
        await db.SaveChangesAsync(ct);

        // Recalculate tutor rating
        await tutorRepo.RecalculateRatingAsync(req.TutorProfileId, ct);

        return Ok(new MessageResponse("Review submitted."));
    }

    // ── GET /api/students/me/wallet ───────────────────────────────────────────
    [HttpGet("me/wallet")]
    [ProducesResponseType(typeof(WalletSummaryDto), 200)]
    public async Task<IActionResult> GetWallet(CancellationToken ct)
    {
        var profile = await studentRepo.GetByUserIdAsync(GetUserId(), ct);
        if (profile is null) return NotFound();

        var txns = await db.CoinTransactions
            .Where(c => c.StudentProfileId == profile.Id)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        return Ok(new WalletSummaryDto(profile.CoinBalance, txns.Select(mapper.Map<CoinTransactionDto>).ToList()));
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
