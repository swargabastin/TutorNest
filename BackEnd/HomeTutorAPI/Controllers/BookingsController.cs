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
[Authorize]
public class BookingsController(
    AppDbContext     db,
    IStudentRepository studentRepo,
    ITutorRepository   tutorRepo,
    IMapper            mapper) : ControllerBase
{
    // ── POST /api/bookings ─────────────────────────────────────────────────────
    // Student requests a session / trial with a tutor
    [HttpPost]
    [ProducesResponseType(typeof(BookingDto), 200)]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest req, CancellationToken ct)
    {
        var userId = GetUserId();
        var student = await studentRepo.GetByUserIdAsync(userId, ct);
        if (student is null)
            return BadRequest(new MessageResponse("Only students can book tutoring sessions.", false));

        var tutor = await tutorRepo.GetByIdAsync(req.TutorProfileId, ct);
        if (tutor is null)
            return NotFound(new MessageResponse("Tutor profile not found.", false));

        if (req.StartTime >= req.EndTime)
            return BadRequest(new MessageResponse("Start time must be before end time.", false));

        if (req.StartTime <= DateTime.UtcNow)
            return BadRequest(new MessageResponse("Cannot book a session in the past.", false));

        // Parse teaching mode
        if (!Enum.TryParse<TeachingMode>(req.Mode, true, out var mode))
            mode = TeachingMode.Online;

        // Check for conflicting confirmed bookings for tutor
        var hasConflict = await db.Bookings.AnyAsync(b =>
            b.TutorProfileId == tutor.Id &&
            b.Status == BookingStatus.Confirmed &&
            b.StartTime < req.EndTime &&
            b.EndTime > req.StartTime, ct);

        if (hasConflict)
            return BadRequest(new MessageResponse("Tutor already has a confirmed session at this time.", false));

        var booking = new Booking
        {
            StudentProfileId = student.Id,
            TutorProfileId   = tutor.Id,
            Subject          = req.Subject,
            Mode             = mode,
            Status           = BookingStatus.Pending,
            StartTime        = DateTime.SpecifyKind(req.StartTime, DateTimeKind.Utc),
            EndTime          = DateTime.SpecifyKind(req.EndTime, DateTimeKind.Utc),
            HourlyRate       = req.IsTrial ? 0 : tutor.HourlyRate,
            IsTrial          = req.IsTrial,
            StudentNotes     = req.StudentNotes,
            LocationAddress  = req.LocationAddress,
            CreatedAt        = DateTime.UtcNow,
            UpdatedAt        = DateTime.UtcNow
        };

        await db.Bookings.AddAsync(booking, ct);
        await db.SaveChangesAsync(ct);

        // Load navigations for mapping
        var fullBooking = await db.Bookings
            .Include(b => b.StudentProfile).ThenInclude(s => s.User)
            .Include(b => b.TutorProfile).ThenInclude(t => t.User)
            .FirstAsync(b => b.Id == booking.Id, ct);

        return Ok(mapper.Map<BookingDto>(fullBooking));
    }

    // ── GET /api/bookings/my ───────────────────────────────────────────────────
    // Returns bookings for the logged-in student or tutor
    [HttpGet("my")]
    [ProducesResponseType(typeof(List<BookingDto>), 200)]
    public async Task<IActionResult> GetMyBookings([FromQuery] string? status, CancellationToken ct)
    {
        var userId = GetUserId();
        var student = await studentRepo.GetByUserIdAsync(userId, ct);
        var tutor = await tutorRepo.GetByUserIdAsync(userId, ct);

        if (student is null && tutor is null)
            return Ok(new List<BookingDto>());

        var query = db.Bookings
            .Include(b => b.StudentProfile).ThenInclude(s => s.User)
            .Include(b => b.TutorProfile).ThenInclude(t => t.User)
            .AsQueryable();

        if (tutor is not null)
            query = query.Where(b => b.TutorProfileId == tutor.Id);
        else if (student is not null)
            query = query.Where(b => b.StudentProfileId == student.Id);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<BookingStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(b => b.Status == parsedStatus);
        }

        var items = await query.OrderBy(b => b.StartTime).ToListAsync(ct);
        return Ok(items.Select(mapper.Map<BookingDto>));
    }

    // ── GET /api/bookings/{id} ─────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(BookingDto), 200)]
    public async Task<IActionResult> GetBookingById(Guid id, CancellationToken ct)
    {
        var booking = await db.Bookings
            .Include(b => b.StudentProfile).ThenInclude(s => s.User)
            .Include(b => b.TutorProfile).ThenInclude(t => t.User)
            .FirstOrDefaultAsync(b => b.Id == id, ct);

        if (booking is null)
            return NotFound(new MessageResponse("Booking not found.", false));

        var userId = GetUserId();
        var isAuthorized = booking.StudentProfile.UserId == userId || booking.TutorProfile.UserId == userId;
        if (!isAuthorized && !User.IsInRole("Admin"))
            return Forbid();

        return Ok(mapper.Map<BookingDto>(booking));
    }

    // ── PUT /api/bookings/{id}/status ──────────────────────────────────────────
    // Tutor confirms, or either party cancels/completes
    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateBookingStatus(
        Guid id, [FromBody] UpdateBookingStatusRequest req, CancellationToken ct)
    {
        var booking = await db.Bookings
            .Include(b => b.StudentProfile).ThenInclude(s => s.User)
            .Include(b => b.TutorProfile).ThenInclude(t => t.User)
            .FirstOrDefaultAsync(b => b.Id == id, ct);

        if (booking is null)
            return NotFound(new MessageResponse("Booking not found.", false));

        var userId = GetUserId();
        var isStudent = booking.StudentProfile.UserId == userId;
        var isTutor   = booking.TutorProfile.UserId == userId;

        if (!isStudent && !isTutor && !User.IsInRole("Admin"))
            return Forbid();

        if (!Enum.TryParse<BookingStatus>(req.Status, true, out var newStatus))
            return BadRequest(new MessageResponse("Invalid booking status.", false));

        if (newStatus == BookingStatus.Confirmed && !isTutor && !User.IsInRole("Admin"))
            return BadRequest(new MessageResponse("Only the tutor can confirm a session.", false));

        booking.Status = newStatus;
        booking.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(req.MeetingLink))
            booking.MeetingLink = req.MeetingLink;

        if (!string.IsNullOrWhiteSpace(req.CancellationReason))
            booking.CancellationReason = req.CancellationReason;

        await db.SaveChangesAsync(ct);
        return Ok(mapper.Map<BookingDto>(booking));
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
