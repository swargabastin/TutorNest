using HomeTutorAPI.DTOs;

namespace HomeTutorAPI.Services.Interfaces;

// ─── Auth ─────────────────────────────────────────────────────────────────────
public interface IAuthService
{
    Task<AuthResponse> RegisterStudentAsync(RegisterStudentRequest req, CancellationToken ct = default);
    Task<AuthResponse> RegisterTutorAsync(RegisterTutorRequest req, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default);
    Task ForgotPasswordAsync(string email, CancellationToken ct = default);
    Task ResetPasswordAsync(ResetPasswordRequest req, CancellationToken ct = default);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest req, CancellationToken ct = default);
    Task LogoutAsync(Guid userId, CancellationToken ct = default);
}

// ─── Tutor ────────────────────────────────────────────────────────────────────
public interface ITutorService
{
    Task<PagedResult<TutorListDto>> SearchAsync(TutorSearchRequest req, CancellationToken ct = default);
    Task<TutorDetailDto?> GetByIdAsync(Guid tutorProfileId, CancellationToken ct = default);
    Task<TutorDetailDto?> GetMyProfileAsync(Guid userId, CancellationToken ct = default);
    Task UpdateProfileAsync(Guid userId, UpdateTutorProfileRequest req, CancellationToken ct = default);
    Task<string> UploadImageAsync(Guid userId, IFormFile file, CancellationToken ct = default);
    Task SetAvailabilityAsync(Guid userId, SetAvailabilityRequest req, CancellationToken ct = default);
    Task<TutorDashboardStatsDto> GetStatsAsync(Guid userId, CancellationToken ct = default);
    Task<WalletSummaryDto> GetWalletAsync(Guid userId, CancellationToken ct = default);
    Task<List<EnquiryDto>> GetEnquiriesAsync(Guid userId, CancellationToken ct = default);
}

// ─── Student ──────────────────────────────────────────────────────────────────
public interface IStudentService
{
    Task<StudentProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<StudentDashboardStatsDto> GetStatsAsync(Guid userId, CancellationToken ct = default);
    Task<RequirementDto> PostRequirementAsync(Guid userId, PostRequirementRequest req, CancellationToken ct = default);
    Task<List<RequirementDto>> GetRequirementsAsync(Guid userId, CancellationToken ct = default);
    Task CloseRequirementAsync(Guid userId, Guid requirementId, CancellationToken ct = default);
    Task SendEnquiryAsync(Guid userId, SendEnquiryRequest req, CancellationToken ct = default);
    Task<List<EnquiryDto>> GetEnquiriesAsync(Guid userId, CancellationToken ct = default);
    Task SubmitReviewAsync(Guid userId, SubmitReviewRequest req, CancellationToken ct = default);
    Task<WalletSummaryDto> GetWalletAsync(Guid userId, CancellationToken ct = default);
}

// ─── Payment ──────────────────────────────────────────────────────────────────
public interface IPaymentService
{
    Task<List<SubscriptionPlanDto>> GetPlansAsync(CancellationToken ct = default);
    Task<RazorpayOrderResponse> CreateOrderAsync(Guid userId, CreateRazorpayOrderRequest req, CancellationToken ct = default);
    Task VerifyPaymentAsync(Guid userId, VerifyPaymentRequest req, CancellationToken ct = default);
}

// ─── Admin ────────────────────────────────────────────────────────────────────
public interface IAdminService
{
    Task<AdminDashboardStatsDto> GetDashboardAsync(CancellationToken ct = default);
    Task<PagedResult<TutorApplicationDto>> GetTutorsAsync(string? status, int page, int pageSize, CancellationToken ct = default);
    Task UpdateTutorStatusAsync(Guid tutorProfileId, string status, CancellationToken ct = default);
    Task<PagedAdminUsersResponse> GetUsersAsync(string? search, string? role, int page, int pageSize, CancellationToken ct = default);
    Task ToggleUserAsync(Guid userId, CancellationToken ct = default);
}

// ─── Email ────────────────────────────────────────────────────────────────────
public interface IEmailService
{
    Task SendPasswordResetAsync(string toEmail, string toName, string resetLink, CancellationToken ct = default);
    Task SendWelcomeAsync(string toEmail, string toName, CancellationToken ct = default);
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
public interface IImageService
{
    Task<string> UploadAsync(IFormFile file, string folder = "profiles", CancellationToken ct = default);
}
