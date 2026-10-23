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
[Route("api/admin")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public class AdminController(
    IUserRepository  userRepo,
    ITutorRepository tutorRepo,
    IMapper          mapper,
    AppDbContext     db) : ControllerBase
{
    // ── GET /api/admin/dashboard ───────────────────────────────────────────────
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(AdminDashboardStatsDto), 200)]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var totalTutors    = await db.Users.CountAsync(u => u.Role == UserRole.Tutor, ct);
        var totalStudents  = await db.Users.CountAsync(u => u.Role == UserRole.Student, ct);
        var pendingApps    = await db.TutorProfiles.CountAsync(t => t.Status == TutorStatus.Pending, ct);
        var totalReqs      = await db.TuitionRequirements.CountAsync(ct);
        var activeSubs     = await db.TutorSubscriptions.CountAsync(s => s.IsActive, ct)
                           + await db.StudentSubscriptions.CountAsync(s => s.IsActive, ct);

        var totalRevenue   = await db.Payments
            .Where(p => p.Status == PaymentStatus.Success)
            .SumAsync(p => p.Amount, ct);

        var monthStart     = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthRevenue   = await db.Payments
            .Where(p => p.Status == PaymentStatus.Success && p.CreatedAt >= monthStart)
            .SumAsync(p => p.Amount, ct);

        // Build last 6-month revenue chart
        var revenueChart = new List<RevenueDataPoint>();
        for (int i = 5; i >= 0; i--)
        {
            var start  = DateTime.UtcNow.AddMonths(-i);
            var mStart = new DateTime(start.Year, start.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var mEnd   = mStart.AddMonths(1);
            var rev    = await db.Payments
                .Where(p => p.Status == PaymentStatus.Success &&
                             p.CreatedAt >= mStart && p.CreatedAt < mEnd)
                .SumAsync(p => p.Amount, ct);
            revenueChart.Add(new RevenueDataPoint(mStart.ToString("MMM"), rev));
        }

        // Build last 6-month user growth chart
        var growthChart = new List<UserGrowthPoint>();
        for (int i = 5; i >= 0; i--)
        {
            var start  = DateTime.UtcNow.AddMonths(-i);
            var mStart = new DateTime(start.Year, start.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var mEnd   = mStart.AddMonths(1);

            var tutors   = await db.Users.CountAsync(u => u.Role == UserRole.Tutor &&
                u.CreatedAt >= mStart && u.CreatedAt < mEnd, ct);
            var students = await db.Users.CountAsync(u => u.Role == UserRole.Student &&
                u.CreatedAt >= mStart && u.CreatedAt < mEnd, ct);

            growthChart.Add(new UserGrowthPoint(mStart.ToString("MMM"), tutors, students));
        }

        return Ok(new AdminDashboardStatsDto(
            TotalTutors:          totalTutors,
            TotalStudents:        totalStudents,
            PendingApplications:  pendingApps,
            TotalRequirements:    totalReqs,
            TotalRevenue:         totalRevenue,
            RevenueThisMonth:     monthRevenue,
            ActiveSubscriptions:  activeSubs,
            RevenueChart:         revenueChart,
            UserGrowthChart:      growthChart));
    }

    // ── GET /api/admin/tutors ─────────────────────────────────────────────────
    [HttpGet("tutors")]
    [ProducesResponseType(typeof(PagedResult<TutorApplicationDto>), 200)]
    public async Task<IActionResult> GetTutors(
        [FromQuery] string? status, [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var q = db.TutorProfiles
            .Include(t => t.User)
            .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TutorStatus>(status, true, out var s))
            q = q.Where(t => t.Status == s);

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(t => t.CreatedAt)
                           .Skip((page - 1) * pageSize).Take(pageSize)
                           .ToListAsync(ct);

        var dtos = items.Select(t => new TutorApplicationDto(
            t.Id, t.User.FullName, t.User.Email, t.User.Phone,
            t.TutorSubjects.Select(ts => ts.Subject.Name).ToArray(),
            t.Qualification, t.ExperienceYears,
            t.Status.ToString(), t.CreatedAt)).ToList();

        return Ok(new PagedResult<TutorApplicationDto>(dtos, total, page, pageSize,
            (int)Math.Ceiling(total / (double)pageSize)));
    }

    // ── PUT /api/admin/tutors/{id}/status ─────────────────────────────────────
    [HttpPut("tutors/{id:guid}/status")]
    public async Task<IActionResult> UpdateTutorStatus(
        Guid id, [FromBody] UpdateTutorStatusRequest req, CancellationToken ct)
    {
        var tutor = await tutorRepo.GetByIdAsync(id, ct);
        if (tutor is null) return NotFound(new MessageResponse("Tutor not found.", false));

        if (!Enum.TryParse<TutorStatus>(req.Status, true, out var status))
            return BadRequest(new MessageResponse("Invalid status.", false));

        tutor.Status     = status;
        tutor.IsVerified = status == TutorStatus.Approved;
        tutor.UpdatedAt  = DateTime.UtcNow;
        tutorRepo.Update(tutor);
        await tutorRepo.SaveChangesAsync(ct);

        return Ok(new MessageResponse($"Tutor status updated to {status}."));
    }

    // ── GET /api/admin/verification-documents/pending ──────────────────────────
    [HttpGet("verification-documents/pending")]
    [ProducesResponseType(typeof(List<object>), 200)]
    public async Task<IActionResult> GetPendingVerificationDocuments(CancellationToken ct)
    {
        var docs = await db.TutorVerificationDocuments
            .Include(d => d.TutorProfile).ThenInclude(t => t.User)
            .Where(d => d.Status == VerificationDocStatus.Pending)
            .OrderBy(d => d.CreatedAt)
            .Select(d => new
            {
                d.Id,
                TutorId    = d.TutorProfileId,
                TutorName  = d.TutorProfile.User.FullName,
                DocType    = d.DocType.ToString(),
                d.FileUrl,
                d.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(docs);
    }

    // ── GET /api/admin/tutors/{id}/verification-documents ──────────────────────
    [HttpGet("tutors/{id:guid}/verification-documents")]
    [ProducesResponseType(typeof(List<TutorVerificationDocumentDto>), 200)]
    public async Task<IActionResult> GetTutorVerificationDocuments(Guid id, CancellationToken ct)
    {
        var docs = await db.TutorVerificationDocuments
            .Where(d => d.TutorProfileId == id)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(ct);

        return Ok(docs.Select(mapper.Map<TutorVerificationDocumentDto>));
    }

    // ── PUT /api/admin/verification-documents/{id}/review ──────────────────────
    [HttpPut("verification-documents/{id:guid}/review")]
    public async Task<IActionResult> ReviewVerificationDocument(
        Guid id, [FromBody] ReviewVerificationDocumentRequest req, CancellationToken ct)
    {
        if (!req.Approve && string.IsNullOrWhiteSpace(req.RejectionReason))
            return BadRequest(new MessageResponse("RejectionReason is required when rejecting or requesting resubmission.", false));

        var doc = await db.TutorVerificationDocuments
            .Include(d => d.TutorProfile)
            .FirstOrDefaultAsync(d => d.Id == id, ct);
        if (doc is null) return NotFound(new MessageResponse("Document not found.", false));

        if (req.RequestResubmission)
        {
            doc.Status = VerificationDocStatus.ResubmissionRequired;
            doc.RejectionReason = req.RejectionReason;
        }
        else
        {
            doc.Status = req.Approve ? VerificationDocStatus.Approved : VerificationDocStatus.Rejected;
            doc.RejectionReason = req.Approve ? null : req.RejectionReason;
        }

        doc.ReviewedAt       = DateTime.UtcNow;
        doc.ReviewedByUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var hasApprovedGovId = await db.TutorVerificationDocuments.AnyAsync(d =>
            d.TutorProfileId == doc.TutorProfileId &&
            d.DocType == VerificationDocType.GovernmentId &&
            (d.Id == doc.Id ? req.Approve : d.Status == VerificationDocStatus.Approved), ct);

        var hasApprovedDegree = await db.TutorVerificationDocuments.AnyAsync(d =>
            d.TutorProfileId == doc.TutorProfileId &&
            d.DocType == VerificationDocType.EducationCertificate &&
            (d.Id == doc.Id ? req.Approve : d.Status == VerificationDocStatus.Approved), ct);

        var hasApprovedPolice = await db.TutorVerificationDocuments.AnyAsync(d =>
            d.TutorProfileId == doc.TutorProfileId &&
            d.DocType == VerificationDocType.PoliceVerification &&
            (d.Id == doc.Id ? req.Approve : d.Status == VerificationDocStatus.Approved), ct);

        var hasApprovedAddress = await db.TutorVerificationDocuments.AnyAsync(d =>
            d.TutorProfileId == doc.TutorProfileId &&
            d.DocType == VerificationDocType.AddressProof &&
            (d.Id == doc.Id ? req.Approve : d.Status == VerificationDocStatus.Approved), ct);

        doc.TutorProfile.IsVerified            = hasApprovedGovId;
        doc.TutorProfile.IdVerified            = hasApprovedGovId;
        doc.TutorProfile.QualificationVerified = hasApprovedDegree;
        doc.TutorProfile.PoliceCheckVerified   = hasApprovedPolice;
        doc.TutorProfile.AddressVerified       = hasApprovedAddress;
        doc.TutorProfile.UpdatedAt             = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        var actionText = req.RequestResubmission ? "resubmission requested" : (req.Approve ? "approved" : "rejected");
        return Ok(new MessageResponse($"Document {actionText}."));
    }

    // ── GET /api/admin/verification-documents/{id}/file ─────────────────────────
    [HttpGet("verification-documents/{id:guid}/file")]
    public async Task<IActionResult> GetVerificationDocumentFile(Guid id, CancellationToken ct)
    {
        var doc = await db.TutorVerificationDocuments.FirstOrDefaultAsync(d => d.Id == id, ct);
        if (doc is null) return NotFound(new MessageResponse("Document not found.", false));

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

    // ── GET /api/admin/coin-refunds ────────────────────────────────────────────
    [HttpGet("coin-refunds")]
    [ProducesResponseType(typeof(List<CoinRefundRequestDto>), 200)]
    public async Task<IActionResult> GetCoinRefunds([FromQuery] string? status, CancellationToken ct)
    {
        var q = db.CoinRefundRequests
            .Include(r => r.TutorProfile).ThenInclude(t => t.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<CoinRefundStatus>(status, true, out var filterStatus))
        {
            q = q.Where(r => r.Status == filterStatus);
        }

        var refunds = await q.OrderByDescending(r => r.CreatedAt).ToListAsync(ct);
        return Ok(refunds.Select(mapper.Map<CoinRefundRequestDto>));
    }

    // ── PUT /api/admin/coin-refunds/{id}/resolve ───────────────────────────────
    [HttpPut("coin-refunds/{id:guid}/resolve")]
    public async Task<IActionResult> ResolveCoinRefund(
        Guid id, [FromBody] ResolveCoinRefundRequest req, CancellationToken ct)
    {
        var refund = await db.CoinRefundRequests
            .Include(r => r.TutorProfile)
            .FirstOrDefaultAsync(r => r.Id == id, ct);

        if (refund is null) return NotFound(new MessageResponse("Coin refund request not found.", false));

        if (refund.Status != CoinRefundStatus.Pending)
            return BadRequest(new MessageResponse($"Cannot resolve refund request with status '{refund.Status}'.", false));

        var adminUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        refund.ReviewedAt = DateTime.UtcNow;
        refund.ReviewedByUserId = adminUserId;
        refund.AdminNotes = req.AdminNotes;

        if (req.Approve)
        {
            refund.Status = CoinRefundStatus.Approved;

            // Atomically credit coins back to tutor's wallet
            refund.TutorProfile.CoinBalance += refund.CoinsRequested;

            var txn = new CoinTransaction
            {
                TutorProfileId = refund.TutorProfileId,
                Type           = TransactionType.Credit,
                Amount         = refund.CoinsRequested,
                BalanceAfter   = refund.TutorProfile.CoinBalance,
                Description    = $"Refund approved: {refund.Reason} (Req #{refund.Id.ToString()[..8]})",
                ReferenceId    = refund.Id
            };

            await db.CoinTransactions.AddAsync(txn, ct);
        }
        else
        {
            refund.Status = CoinRefundStatus.Rejected;
        }

        await db.SaveChangesAsync(ct);
        return Ok(new MessageResponse($"Refund request {(req.Approve ? "approved and coins credited" : "rejected")}."));
    }

    // ── GET /api/admin/whatsapp-logs ───────────────────────────────────────────
    [HttpGet("whatsapp-logs")]
    [ProducesResponseType(typeof(List<WhatsAppNotificationLogDto>), 200)]
    public async Task<IActionResult> GetWhatsAppLogs(CancellationToken ct)
    {
        var logs = await db.WhatsAppNotificationLogs
            .Include(l => l.TutorProfile).ThenInclude(t => t.User)
            .OrderByDescending(l => l.CreatedAt)
            .Take(100)
            .ToListAsync(ct);

        return Ok(logs.Select(mapper.Map<WhatsAppNotificationLogDto>));
    }

    // ── GET /api/admin/users ──────────────────────────────────────────────────
    [HttpGet("users")]
    [ProducesResponseType(typeof(PagedAdminUsersResponse), 200)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search, [FromQuery] string? role,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var (users, total) = await userRepo.GetPagedAsync(search, role, page, pageSize, ct);
        var dtos = users.Select(u => new AdminUserDto(
            u.Id, u.FullName, u.Email, u.Phone, u.City,
            u.Role.ToString(), u.IsActive, u.CreatedAt)).ToList();

        return Ok(new PagedAdminUsersResponse(dtos, total, page,
            (int)Math.Ceiling(total / (double)pageSize)));
    }

    // ── PUT /api/admin/users/{id}/toggle ──────────────────────────────────────
    [HttpPut("users/{id:guid}/toggle")]
    public async Task<IActionResult> ToggleUserStatus(Guid id, CancellationToken ct)
    {
        var user = await userRepo.GetByIdAsync(id, ct);
        if (user is null) return NotFound(new MessageResponse("User not found.", false));
        user.IsActive = !user.IsActive;
        userRepo.Update(user);
        await userRepo.SaveChangesAsync(ct);
        return Ok(new MessageResponse($"User {(user.IsActive ? "activated" : "deactivated")}."));
    }

    // ── GET /api/admin/payments ───────────────────────────────────────────────
    [HttpGet("payments")]
    public async Task<IActionResult> GetPayments(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var q = db.Payments.Include(p => p.User)
            .Where(p => p.Status == PaymentStatus.Success)
            .OrderByDescending(p => p.CreatedAt);

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return Ok(new
        {
            Items = items.Select(p => new
            {
                p.Id, User = p.User.FullName, p.Type, p.Amount,
                p.Currency, p.Status, p.CreatedAt
            }),
            TotalCount = total, Page = page,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        });
    }

    // ── GET /api/admin/requirements ───────────────────────────────────────────
    [HttpGet("requirements")]
    public async Task<IActionResult> GetRequirements(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var q = db.TuitionRequirements
            .Include(r => r.StudentProfile).ThenInclude(sp => sp.User)
            .OrderByDescending(r => r.CreatedAt);

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return Ok(new
        {
            Items = items.Select(r => new
            {
                r.Id, StudentName = r.StudentProfile.User.FullName,
                r.Subject, r.Level, r.City, r.Mode, r.Status,
                r.ResponseCount, r.CreatedAt
            }),
            TotalCount = total
        });
    }
}
