using System.ComponentModel.DataAnnotations;
using HomeTutorAPI.Models;

namespace HomeTutorAPI.DTOs;

// ════════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════════

public record RegisterStudentRequest(
    [Required, MaxLength(120)]  string FullName,
    [Required, EmailAddress]    string Email,
    [Required, MaxLength(15)]   string Phone,
    [Required, MinLength(8)]    string Password,
    [Required]                  string ConfirmPassword,
    string? City
);

public record RegisterTutorRequest(
    [Required, MaxLength(120)]  string FullName,
    [Required, EmailAddress]    string Email,
    [Required, MaxLength(15)]   string Phone,
    [Required, MinLength(8)]    string Password,
    [Required]                  string ConfirmPassword,
    string? City,
    string? Qualification,
    int ExperienceYears,
    List<int> SubjectIds,
    List<string> TeachingLevels,
    string? Bio,
    TeachingMode TeachingMode,
    decimal HourlyRate
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required]               string Password
);

public record GoogleLoginRequest(
    [Required] string GoogleToken
);

public record RefreshTokenRequest(
    [Required] string RefreshToken
);

public record ForgotPasswordRequest(
    [Required, EmailAddress] string Email
);

public record ResetPasswordRequest(
    [Required] string Token,
    [Required] string Email,
    [Required, MinLength(8)] string NewPassword
);

public record ChangePasswordRequest(
    [Required] string CurrentPassword,
    [Required, MinLength(8)] string NewPassword
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    UserDto User
);

// ════════════════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════════════════

public record UserDto(
    Guid   Id,
    string FullName,
    string Email,
    string? Phone,
    string? City,
    string? ProfileImage,
    string Role,
    bool   IsActive,
    DateTime CreatedAt
);

// ════════════════════════════════════════════════════════════════════════════
// TUTOR
// ════════════════════════════════════════════════════════════════════════════

public record TutorListDto(
    Guid     Id,          // TutorProfile.Id
    Guid     UserId,
    string   Name,
    string?  Avatar,
    string[] Subjects,
    int      Experience,
    decimal  Rating,
    int      ReviewCount,
    decimal  HourlyRate,
    string?  Location,
    string   Mode,        // "Online" | "Offline" | "Both"
    string?  Qualification,
    string   Bio,
    bool     IsVerified,
    string[] Languages,
    string[] TeachingLevels,
    string?  ResponseTime,
    int      StudentsTaught,
    string?  Locality = null,
    string?  Pincode = null,
    string[]? Boards = null,
    bool     OffersFreeDemo = true
);

public record TutorDetailDto(
    Guid       Id,
    Guid       UserId,
    string     Name,
    string?    Avatar,
    string[]   Subjects,
    int        Experience,
    decimal    Rating,
    int        ReviewCount,
    decimal    HourlyRate,
    string?    Location,
    string     Mode,
    string?    Qualification,
    string?    Bio,
    bool       IsVerified,
    string[]   Languages,
    string[]   TeachingLevels,
    string?    ResponseTime,
    int        StudentsTaught,
    string?    Phone,
    string?    Email,
    List<ReviewDto>        Reviews,
    List<AvailabilityDto>  Availabilities,
    string?    Locality = null,
    string?    Pincode = null,
    int?       TravelRadiusKm = null,
    string[]?  Boards = null,
    bool       OffersFreeDemo = true
);

public record UpdateTutorProfileRequest(
    string? Qualification,
    int? ExperienceYears,
    string? Bio,
    TeachingMode? TeachingMode,
    decimal? HourlyRate,
    List<int>? SubjectIds,
    List<string>? TeachingLevels,
    List<string>? Languages,
    string? ResponseTime,
    string? Locality = null,
    string? Pincode = null,
    int? TravelRadiusKm = null,
    List<string>? Boards = null,
    bool? OffersFreeDemo = null
);

public record TutorDashboardStatsDto(
    int     ProfileViews,
    int     StudentLeads,
    int     ClassesThisWeek,
    decimal Earnings,
    int     CoinBalance,
    decimal Rating,
    int     ReviewCount
);

// ════════════════════════════════════════════════════════════════════════════
// STUDENT
// ════════════════════════════════════════════════════════════════════════════

public record StudentProfileDto(
    Guid     Id,
    Guid     UserId,
    string   Name,
    string?  Avatar,
    string?  Email,
    string?  Phone,
    string?  Location,
    DateTime JoinedDate,
    int      CoinBalance,
    List<RequirementDto> Requirements
);

public record StudentDashboardStatsDto(
    int ActiveRequirements,
    int TutorResponses,
    int CoinBalance,
    int TotalEnquiries
);

// ════════════════════════════════════════════════════════════════════════════
// TUITION REQUIREMENTS
// ════════════════════════════════════════════════════════════════════════════

public record PostRequirementRequest(
    [Required, MaxLength(100)] string Subject,
    [Required, MaxLength(50)]  string Level,
    string? City,
    [Required] string Mode,       // "Online" | "Offline" | "Both"
    string? Budget,
    int? FrequencyPerWeek,
    string? Description,
    string? Board = null,
    string? Locality = null,
    string? Pincode = null
);

public record RequirementDto(
    Guid     Id,
    string   Subject,
    string   Level,
    string?  City,
    string   Mode,
    string?  Budget,
    int?     FrequencyPerWeek,
    string?  Description,
    string   Status,
    int      ResponseCount,
    DateTime CreatedAt,
    string?  Board = null,
    string?  Locality = null,
    string?  Pincode = null
);

// ════════════════════════════════════════════════════════════════════════════
// ENQUIRY
// ════════════════════════════════════════════════════════════════════════════

public record SendEnquiryRequest(
    [Required] Guid   TutorProfileId,
    [Required, MaxLength(100)] string Subject,
    [Required, MaxLength(50)]  string Level,
    string? Message
);

public record EnquiryDto(
    Guid     Id,
    Guid     TutorProfileId,
    string?  TutorName,
    string?  TutorAvatar,
    string?  StudentName,
    string?  StudentAvatar,
    string   Subject,
    string   Level,
    string?  Message,
    bool     IsRead,
    DateTime CreatedAt
);

// ════════════════════════════════════════════════════════════════════════════
// REVIEW
// ════════════════════════════════════════════════════════════════════════════

public record SubmitReviewRequest(
    [Required] Guid TutorProfileId,
    [Range(1, 5)]  int    Rating,
    string? ReviewText
);

public record ReviewDto(
    Guid     Id,
    string   StudentName,
    string?  StudentAvatar,
    int      Rating,
    string?  ReviewText,
    DateTime CreatedAt
);

// ════════════════════════════════════════════════════════════════════════════
// AVAILABILITY
// ════════════════════════════════════════════════════════════════════════════

public record SetAvailabilityRequest(
    List<AvailabilitySlotRequest> Slots
);

public record AvailabilitySlotRequest(
    DayOfWeek DayOfWeek,
    TimeOnly  StartTime,
    TimeOnly  EndTime
);

public record AvailabilityDto(
    int       Id,
    string    Day,
    TimeOnly  StartTime,
    TimeOnly  EndTime
);

// ════════════════════════════════════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════════════════════════════════════

public record TutorSearchRequest(
    string?   Search,
    string?   City,
    string?   Subject,
    string?   Level,
    string[]? Mode,
    decimal   MinRate = 0,
    decimal   MaxRate = 5000,
    decimal   MinRating = 0,
    bool      VerifiedOnly = false,
    string    SortBy = "rating",    // rating | experience | price-low | price-high
    int       Page = 1,
    int       PageSize = 12,
    string?   Locality = null,
    string?   Pincode = null,
    string[]? Boards = null,
    bool?     FreeDemoOnly = null
);

public record PagedResult<T>(
    List<T> Items,
    int     TotalCount,
    int     Page,
    int     PageSize,
    int     TotalPages
);

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION & PAYMENT
// ════════════════════════════════════════════════════════════════════════════

public record SubscriptionPlanDto(
    int      Id,
    string   Name,
    string   Tier,
    string   Audience,
    decimal  Price,
    int      CoinsPerMonth,
    string[] Features,
    bool     IsPopular,
    int      DurationDays
);

public record CreateRazorpayOrderRequest(
    int? PlanId,
    int? CoinPackageAmount   // raw INR amount for coin purchase
);

public record RazorpayOrderResponse(
    string OrderId,
    decimal Amount,
    string Currency,
    string Key
);

public record VerifyPaymentRequest(
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature,
    string PaymentType,     // "subscription" | "coin_purchase"
    int?   PlanId,
    int?   CoinsAmount
);

public record CoinPackageDto(
    int     Coins,
    decimal Price,
    bool    IsPopular
);

// ════════════════════════════════════════════════════════════════════════════
// WALLET / COIN TRANSACTIONS
// ════════════════════════════════════════════════════════════════════════════

public record CoinTransactionDto(
    Guid     Id,
    string   Type,          // "Credit" | "Debit"
    int      Amount,
    string   Description,
    DateTime CreatedAt,
    int      BalanceAfter
);

public record WalletSummaryDto(
    int                   Balance,
    List<CoinTransactionDto> Transactions
);

// ════════════════════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════════════════════

public record AdminDashboardStatsDto(
    int     TotalTutors,
    int     TotalStudents,
    int     PendingApplications,
    int     TotalRequirements,
    decimal TotalRevenue,
    decimal RevenueThisMonth,
    int     ActiveSubscriptions,
    List<RevenueDataPoint>  RevenueChart,
    List<UserGrowthPoint>   UserGrowthChart
);

public record RevenueDataPoint(string Month, decimal Revenue);
public record UserGrowthPoint(string Month, int Tutors, int Students);

public record TutorApplicationDto(
    Guid     Id,
    string   Name,
    string?  Email,
    string?  Phone,
    string[] Subjects,
    string?  Qualification,
    int      ExperienceYears,
    string   Status,
    DateTime AppliedDate
);

public record UpdateTutorStatusRequest(
    [Required] string Status  // "Approved" | "Rejected"
);

public record AdminUserDto(
    Guid     Id,
    string   FullName,
    string   Email,
    string?  Phone,
    string?  City,
    string   Role,
    bool     IsActive,
    DateTime CreatedAt
);

public record PagedAdminUsersResponse(
    List<AdminUserDto> Users,
    int TotalCount,
    int Page,
    int TotalPages
);

// ════════════════════════════════════════════════════════════════════════════
// SHARED
// ════════════════════════════════════════════════════════════════════════════

public record MessageResponse(string Message, bool Success = true);

public record SubjectDto(int Id, string Name, string? Category);
public record LocationDto(int Id, string City, string? State);

// ════════════════════════════════════════════════════════════════════════════
// TUTOR VERIFICATION DOCUMENTS
// ════════════════════════════════════════════════════════════════════════════

public record TutorVerificationDocumentDto(
    Guid      Id,
    string    DocType,
    string    Status,
    string    FileUrl,
    string?   RejectionReason,
    DateTime  CreatedAt,
    DateTime? ReviewedAt);

public record ReviewVerificationDocumentRequest(
    bool    Approve,
    string? RejectionReason);

public record TutorVerificationSummaryDto(
    bool IsVerified,
    int  DocumentsSubmitted,
    int  DocumentsApproved,
    int  DocumentsPending);

// ════════════════════════════════════════════════════════════════════════════
// BOOKINGS & CLASS SCHEDULING
// ════════════════════════════════════════════════════════════════════════════

public record CreateBookingRequest(
    Guid     TutorProfileId,
    string   Subject,
    string   Mode,           // "Online" | "Offline"
    DateTime StartTime,
    DateTime EndTime,
    bool     IsTrial = false,
    string?  StudentNotes = null,
    string?  LocationAddress = null,
    string?  GradeLevel = null
);

public record BookingDto(
    Guid     Id,
    Guid     StudentProfileId,
    string   StudentName,
    string?  StudentEmail,
    string?  StudentPhone,
    Guid     TutorProfileId,
    string   TutorName,
    string?  TutorAvatar,
    string   Subject,
    string   Mode,
    string   Status,
    DateTime StartTime,
    DateTime EndTime,
    decimal  HourlyRate,
    bool     IsTrial,
    string?  MeetingLink,
    string?  LocationAddress,
    string?  StudentNotes,
    string?  CancellationReason,
    DateTime CreatedAt,
    string?  GradeLevel = null
);

public record UpdateBookingStatusRequest(
    string   Status,               // "Confirmed" | "Cancelled" | "Completed"
    string?  MeetingLink = null,
    string?  CancellationReason = null
);

// ════════════════════════════════════════════════════════════════════════════
// MESSAGING / CHAT
// ════════════════════════════════════════════════════════════════════════════

public record StartConversationRequest(
    Guid    TutorProfileId,
    string? Subject = null,
    string? InitialMessage = null
);

public record SendChatMessageRequest(
    string Content
);

public record ChatMessageDto(
    Guid     Id,
    Guid     ConversationId,
    Guid     SenderUserId,
    string   SenderName,
    string?  SenderAvatar,
    string   Content,
    bool     IsRead,
    DateTime SentAt
);

public record ConversationDto(
    Guid     Id,
    Guid     StudentProfileId,
    string   StudentName,
    string?  StudentAvatar,
    Guid     TutorProfileId,
    string   TutorName,
    string?  TutorAvatar,
    string?  Subject,
    string?  LastMessage,
    DateTime LastMessageAt,
    int      UnreadCount,
    DateTime CreatedAt
);


