using AutoMapper;
using HomeTutorAPI.Data;
using HomeTutorAPI.DTOs;
using HomeTutorAPI.Models;
using HomeTutorAPI.Repositories.Interfaces;
using HomeTutorAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeTutorAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController(
    IUserRepository    userRepo,
    ITutorRepository   tutorRepo,
    IStudentRepository studentRepo,
    ITokenService      tokenService,
    IMapper            mapper,
    AppDbContext       db,
    ILogger<AuthController> logger) : ControllerBase
{
    // ── POST /api/auth/register/student ───────────────────────────────────────
    [HttpPost("register/student")]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    public async Task<IActionResult> RegisterStudent(
        [FromBody] RegisterStudentRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (req.Password != req.ConfirmPassword)
            return BadRequest(new MessageResponse("Passwords do not match.", false));

        if (await userRepo.GetByEmailAsync(req.Email, ct) is not null)
            return Conflict(new MessageResponse("Email already registered.", false));

        var user = new User
        {
            FullName     = req.FullName,
            Email        = req.Email.ToLowerInvariant(),
            Phone        = req.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role         = UserRole.Student,
            City         = req.City,
        };

        await userRepo.AddAsync(user, ct);
        await db.StudentProfiles.AddAsync(new StudentProfile { UserId = user.Id }, ct);
        await userRepo.SaveChangesAsync(ct);

        return Ok(BuildAuth(user));
    }

    // ── POST /api/auth/register/tutor ─────────────────────────────────────────
    [HttpPost("register/tutor")]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    public async Task<IActionResult> RegisterTutor(
        [FromBody] RegisterTutorRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (req.Password != req.ConfirmPassword)
            return BadRequest(new MessageResponse("Passwords do not match.", false));

        if (await userRepo.GetByEmailAsync(req.Email, ct) is not null)
            return Conflict(new MessageResponse("Email already registered.", false));

        var user = new User
        {
            FullName     = req.FullName,
            Email        = req.Email.ToLowerInvariant(),
            Phone        = req.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role         = UserRole.Tutor,
            City         = req.City,
        };

        await userRepo.AddAsync(user, ct);

        var profile = new TutorProfile
        {
            UserId          = user.Id,
            Qualification   = req.Qualification,
            ExperienceYears = req.ExperienceYears,
            Bio             = req.Bio,
            TeachingMode    = req.TeachingMode,
            HourlyRate      = req.HourlyRate,
            TeachingLevels  = req.TeachingLevels.ToArray(),
        };
        await db.TutorProfiles.AddAsync(profile, ct);
        await userRepo.SaveChangesAsync(ct);

        // Add subjects
        foreach (var sId in req.SubjectIds)
        {
            if (await db.Subjects.AnyAsync(s => s.Id == sId, ct))
                await db.TutorSubjects.AddAsync(new TutorSubject
                    { TutorProfileId = profile.Id, SubjectId = sId }, ct);
        }
        await userRepo.SaveChangesAsync(ct);

        return Ok(BuildAuth(user));
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest req, CancellationToken ct)
    {
        var user = await userRepo.GetByEmailAsync(req.Email.ToLowerInvariant(), ct);

        if (user is null || user.PasswordHash is null ||
            !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new MessageResponse("Invalid email or password.", false));

        if (!user.IsActive)
            return Unauthorized(new MessageResponse("Account has been deactivated.", false));

        return Ok(BuildAuth(user));
    }

    // ── POST /api/auth/refresh ────────────────────────────────────────────────
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenRequest req, CancellationToken ct)
    {
        var user = await userRepo.GetByRefreshTokenAsync(req.RefreshToken, ct);
        if (user is null || user.RefreshTokenExpiry < DateTime.UtcNow)
            return Unauthorized(new MessageResponse("Invalid or expired refresh token.", false));

        return Ok(BuildAuth(user));
    }

    // ── POST /api/auth/forgot-password ────────────────────────────────────────
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest req, CancellationToken ct)
    {
        var user = await userRepo.GetByEmailAsync(req.Email.ToLowerInvariant(), ct);
        // Always return 200 to prevent enumeration
        if (user is not null)
        {
            user.ResetToken       = tokenService.GenerateRefreshToken()[..32];
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(2);
            await userRepo.SaveChangesAsync(ct);
            // TODO: send email with reset link using MailKit
            logger.LogInformation("Password reset token for {Email}: {Token}", user.Email, user.ResetToken);
        }
        return Ok(new MessageResponse("If that email exists, a reset link has been sent."));
    }

    // ── POST /api/auth/reset-password ─────────────────────────────────────────
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest req, CancellationToken ct)
    {
        var user = await userRepo.GetByEmailAsync(req.Email.ToLowerInvariant(), ct);
        if (user is null || user.ResetToken != req.Token || user.ResetTokenExpiry < DateTime.UtcNow)
            return BadRequest(new MessageResponse("Invalid or expired reset token.", false));

        user.PasswordHash     = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.ResetToken       = null;
        user.ResetTokenExpiry = null;
        await userRepo.SaveChangesAsync(ct);
        return Ok(new MessageResponse("Password reset successfully."));
    }

    // ── POST /api/auth/change-password ────────────────────────────────────────
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest req, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var user   = await userRepo.GetByIdAsync(userId, ct);
        if (user is null) return NotFound();

        if (user.PasswordHash is null || !BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest(new MessageResponse("Current password is incorrect.", false));

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await userRepo.SaveChangesAsync(ct);
        return Ok(new MessageResponse("Password changed successfully."));
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────────
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var user   = await userRepo.GetByIdAsync(userId, ct);
        if (user is not null)
        {
            user.RefreshToken       = null;
            user.RefreshTokenExpiry = null;
            await userRepo.SaveChangesAsync(ct);
        }
        return Ok(new MessageResponse("Logged out successfully."));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private AuthResponse BuildAuth(User user)
    {
        var access  = tokenService.GenerateAccessToken(user);
        var refresh = tokenService.GenerateRefreshToken();

        user.RefreshToken       = refresh;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
        userRepo.SaveChangesAsync().GetAwaiter().GetResult();

        return new AuthResponse(access, refresh, mapper.Map<UserDto>(user));
    }

    private Guid GetCurrentUserId()
        => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
}
