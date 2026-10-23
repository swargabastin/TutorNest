using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeTutorAPI.Models;

// ─── Enums ────────────────────────────────────────────────────────────────────

public enum UserRole { Student, Tutor, Admin }
public enum TutorStatus { Pending, Approved, Rejected }
public enum TeachingMode { Online, Offline, Both }
public enum RequirementMode { Online, Offline, Both }
public enum RequirementStatus { Active, Closed }
public enum TransactionType { Credit, Debit }
public enum PaymentStatus { Pending, Success, Failed, Refunded }
public enum PaymentType { CoinPurchase, Subscription, TuitionFee }
public enum SubscriptionTier { Free, Basic, Pro, Premium }
public enum PlanAudience { Student, Tutor, Both }
public enum ReviewStatus { Visible, Hidden }
public enum BookingStatus { Pending, Confirmed, Cancelled, Completed, Rescheduled }

// ─── User ─────────────────────────────────────────────────────────────────────

public class User
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)] public string FullName { get; set; } = "";
    [Required, MaxLength(255)] public string Email    { get; set; } = "";
    [MaxLength(15)]            public string? Phone   { get; set; }
    public string? PasswordHash { get; set; }       // null = Google-only account
    public UserRole Role        { get; set; }
    public bool IsActive        { get; set; } = true;
    public bool EmailVerified   { get; set; } = false;
    public string? GoogleId     { get; set; }
    public string? ProfileImage { get; set; }       // Cloudinary URL
    public string? City         { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public string? ResetToken   { get; set; }
    public DateTime? ResetTokenExpiry   { get; set; }
    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt   { get; set; } = DateTime.UtcNow;

    // Navigation
    public TutorProfile?  TutorProfile  { get; set; }
    public StudentProfile? StudentProfile { get; set; }
}

// ─── TutorProfile ─────────────────────────────────────────────────────────────

public class TutorProfile
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(User))]
    public Guid UserId { get; set; }
    public User User   { get; set; } = null!;

    [MaxLength(300)] public string? Qualification  { get; set; }
    public int       ExperienceYears               { get; set; }
    [MaxLength(2000)] public string? Bio           { get; set; }
    public TeachingMode TeachingMode               { get; set; } = TeachingMode.Both;
    public decimal   HourlyRate                    { get; set; }
    public TutorStatus Status                      { get; set; } = TutorStatus.Pending;
    public bool      IsVerified                    { get; set; } = false;
    public bool      IsFeatured                    { get; set; } = false;
    public decimal   RatingAvg                     { get; set; } = 0;
    public int       RatingCount                   { get; set; } = 0;
    public int       StudentsTaught                { get; set; } = 0;
    public string?   ResponseTime                  { get; set; } // "Within 2 hours"
    public int       CoinBalance                   { get; set; } = 0;
    public decimal   EarningsBalance               { get; set; } = 0;
    public string[]  Languages                     { get; set; } = [];
    public string[]  TeachingLevels                { get; set; } = [];
    public string[]  Boards                        { get; set; } = [];
    public bool      OffersFreeDemo                { get; set; } = true;
    [MaxLength(100)] public string? Locality       { get; set; }
    [MaxLength(10)]  public string? Pincode        { get; set; }
    public int?      TravelRadiusKm                { get; set; }
    public DateTime  CreatedAt                     { get; set; } = DateTime.UtcNow;
    public DateTime  UpdatedAt                     { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TutorSubject>               TutorSubjects         { get; set; } = [];
    public ICollection<Review>                     Reviews               { get; set; } = [];
    public ICollection<Enquiry>                    Enquiries             { get; set; } = [];
    public ICollection<CoinTransaction>            CoinTransactions      { get; set; } = [];
    public ICollection<TutorSubscription>          Subscriptions         { get; set; } = [];
    public ICollection<Availability>               Availabilities        { get; set; } = [];
    public ICollection<TutorVerificationDocument>  VerificationDocuments { get; set; } = [];
    public ICollection<Booking>                    Bookings              { get; set; } = [];
}

// ─── StudentProfile ───────────────────────────────────────────────────────────

public class StudentProfile
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(User))]
    public Guid UserId { get; set; }
    public User User   { get; set; } = null!;

    public int  CoinBalance { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TuitionRequirement>  Requirements   { get; set; } = [];
    public ICollection<Review>              Reviews        { get; set; } = [];
    public ICollection<Enquiry>             Enquiries      { get; set; } = [];
    public ICollection<CoinTransaction>     CoinTransactions { get; set; } = [];
    public ICollection<StudentSubscription> Subscriptions  { get; set; } = [];
    public ICollection<Booking>             Bookings       { get; set; } = [];
}

// ─── Subject ──────────────────────────────────────────────────────────────────

public class Subject
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    [MaxLength(50)]            public string? Category { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<TutorSubject> TutorSubjects { get; set; } = [];
}

// ─── TutorSubject (join) ──────────────────────────────────────────────────────

public class TutorSubject
{
    [Key] public int Id { get; set; }

    [ForeignKey(nameof(TutorProfile))]
    public Guid TutorProfileId { get; set; }
    public TutorProfile TutorProfile { get; set; } = null!;

    [ForeignKey(nameof(Subject))]
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
}

// ─── Location ─────────────────────────────────────────────────────────────────

public class Location
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(100)] public string City     { get; set; } = "";
    [MaxLength(100)]           public string? State   { get; set; }
    [MaxLength(100)]           public string? Country { get; set; } = "India";
    public bool IsActive { get; set; } = true;
}

// ─── Subscription Plan ────────────────────────────────────────────────────────

public class SubscriptionPlan
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(80)] public string Name { get; set; } = "";
    public SubscriptionTier   Tier              { get; set; }
    public PlanAudience       Audience          { get; set; } = PlanAudience.Both;
    public decimal            Price             { get; set; }
    public int                CoinsPerMonth     { get; set; }
    public string[]           Features          { get; set; } = [];
    public int                DurationDays      { get; set; } = 30;
    public bool                IsPopular         { get; set; } = false;
    public bool               IsActive          { get; set; } = true;
    public DateTime           CreatedAt         { get; set; } = DateTime.UtcNow;
}

// ─── TutorSubscription ────────────────────────────────────────────────────────

public class TutorSubscription
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(TutorProfile))]
    public Guid TutorProfileId   { get; set; }
    public TutorProfile TutorProfile { get; set; } = null!;

    [ForeignKey(nameof(SubscriptionPlan))]
    public int PlanId            { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;

    [ForeignKey(nameof(Payment))]
    public Guid? PaymentId { get; set; }
    public Payment? Payment { get; set; }

    public DateTime StartsAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool     IsActive  { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ─── StudentSubscription ──────────────────────────────────────────────────────

public class StudentSubscription
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(StudentProfile))]
    public Guid StudentProfileId   { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    [ForeignKey(nameof(SubscriptionPlan))]
    public int PlanId              { get; set; }
    public SubscriptionPlan Plan   { get; set; } = null!;

    [ForeignKey(nameof(Payment))]
    public Guid? PaymentId { get; set; }
    public Payment? Payment { get; set; }

    public DateTime StartsAt  { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool     IsActive  { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

public class Payment
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(User))]
    public Guid UserId { get; set; }
    public User User   { get; set; } = null!;

    public PaymentType   Type               { get; set; }
    public PaymentStatus Status             { get; set; } = PaymentStatus.Pending;
    public decimal       Amount             { get; set; }
    public string        Currency           { get; set; } = "INR";

    // Razorpay
    public string? RazorpayOrderId   { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public string? RazorpaySignature { get; set; }

    // Coin purchase metadata
    public int?    CoinsAwarded { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// ─── CoinTransaction ──────────────────────────────────────────────────────────

public class CoinTransaction
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    // Either tutor or student
    public Guid?         TutorProfileId   { get; set; }
    public TutorProfile? TutorProfile     { get; set; }

    public Guid?          StudentProfileId { get; set; }
    public StudentProfile? StudentProfile  { get; set; }

    public TransactionType Type            { get; set; }
    public int             Amount          { get; set; }
    public int             BalanceAfter    { get; set; }
    [MaxLength(200)] public string Description { get; set; } = "";
    public Guid?           ReferenceId     { get; set; }  // payment_id / enquiry_id
    public DateTime        CreatedAt       { get; set; } = DateTime.UtcNow;
}

// ─── TuitionRequirement ───────────────────────────────────────────────────────

public class TuitionRequirement
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(StudentProfile))]
    public Guid StudentProfileId     { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    [Required, MaxLength(100)] public string Subject  { get; set; } = "";
    [MaxLength(50)]            public string Level    { get; set; } = "";
    [MaxLength(50)]            public string? Board   { get; set; }
    [MaxLength(100)]           public string? City    { get; set; }
    [MaxLength(100)]           public string? Locality { get; set; }
    [MaxLength(10)]            public string? Pincode { get; set; }
    public RequirementMode Mode                       { get; set; }
    [MaxLength(50)]            public string? Budget  { get; set; }
    public int?   FrequencyPerWeek                    { get; set; }
    [MaxLength(2000)] public string? Description      { get; set; }
    public RequirementStatus Status                   { get; set; } = RequirementStatus.Active;
    public int ResponseCount                          { get; set; } = 0;
    public DateTime CreatedAt                         { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt                         { get; set; } = DateTime.UtcNow;
}

// ─── Enquiry ──────────────────────────────────────────────────────────────────

public class Enquiry
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(StudentProfile))]
    public Guid StudentProfileId     { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    [ForeignKey(nameof(TutorProfile))]
    public Guid TutorProfileId       { get; set; }
    public TutorProfile TutorProfile { get; set; } = null!;

    [MaxLength(100)]  public string Subject  { get; set; } = "";
    [MaxLength(50)]   public string Level    { get; set; } = "";
    [MaxLength(2000)] public string? Message { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ─── Review ───────────────────────────────────────────────────────────────────

public class Review
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(TutorProfile))]
    public Guid TutorProfileId       { get; set; }
    public TutorProfile TutorProfile { get; set; } = null!;

    [ForeignKey(nameof(StudentProfile))]
    public Guid StudentProfileId     { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    [Range(1, 5)] public int Rating    { get; set; }
    [MaxLength(2000)] public string? ReviewText { get; set; }
    public ReviewStatus Status         { get; set; } = ReviewStatus.Visible;
    public DateTime CreatedAt          { get; set; } = DateTime.UtcNow;
}

// ─── Availability ─────────────────────────────────────────────────────────────

public class Availability
{
    [Key] public int Id { get; set; }

    [ForeignKey(nameof(TutorProfile))]
    public Guid TutorProfileId       { get; set; }
    public TutorProfile TutorProfile { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly  StartTime { get; set; }
    public TimeOnly  EndTime   { get; set; }
    public bool      IsActive  { get; set; } = true;
}

// ─── Verification Documents ───────────────────────────────────────────────────

public enum VerificationDocType   { GovernmentId, EducationCertificate, PoliceVerification, AddressProof }
public enum VerificationDocStatus { Pending, Approved, Rejected }

// ─── TutorVerificationDocument ────────────────────────────────────────────────
// One row per document a tutor uploads for identity/qualification verification.
// TutorProfile.IsVerified is set true once a GovernmentId document has been Approved.
public class TutorVerificationDocument
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(TutorProfile))]
    public Guid TutorProfileId { get; set; }
    public TutorProfile TutorProfile { get; set; } = null!;

    public VerificationDocType   DocType { get; set; }
    public VerificationDocStatus Status  { get; set; } = VerificationDocStatus.Pending;

    [MaxLength(500)] public string  FileUrl         { get; set; } = string.Empty;
    [MaxLength(500)] public string? RejectionReason { get; set; }

    public Guid?    ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt      { get; set; }
    public DateTime  CreatedAt       { get; set; } = DateTime.UtcNow;
}

// ─── Booking / Class Scheduling ───────────────────────────────────────────────

public class Booking
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(StudentProfile))]
    public Guid StudentProfileId         { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    [ForeignKey(nameof(TutorProfile))]
    public Guid TutorProfileId           { get; set; }
    public TutorProfile TutorProfile     { get; set; } = null!;

    [Required, MaxLength(100)]
    public string Subject                { get; set; } = "";

    [MaxLength(50)]
    public string? GradeLevel            { get; set; }

    public TeachingMode Mode             { get; set; } = TeachingMode.Online;
    public BookingStatus Status          { get; set; } = BookingStatus.Pending;

    public DateTime StartTime            { get; set; }
    public DateTime EndTime              { get; set; }
    public decimal  HourlyRate           { get; set; } = 0;
    public bool     IsTrial              { get; set; } = false;

    [MaxLength(500)]
    public string? MeetingLink           { get; set; }

    [MaxLength(500)]
    public string? LocationAddress       { get; set; }

    [MaxLength(1000)]
    public string? StudentNotes          { get; set; }

    [MaxLength(1000)]
    public string? CancellationReason    { get; set; }

    public DateTime CreatedAt            { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt            { get; set; } = DateTime.UtcNow;
}

// ─── Messaging / Chat ─────────────────────────────────────────────────────────

public class Conversation
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(StudentProfile))]
    public Guid StudentProfileId         { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    [ForeignKey(nameof(TutorProfile))]
    public Guid TutorProfileId           { get; set; }
    public TutorProfile TutorProfile     { get; set; } = null!;

    [MaxLength(100)]
    public string? Subject               { get; set; }

    public DateTime LastMessageAt        { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt            { get; set; } = DateTime.UtcNow;

    public ICollection<ChatMessage> Messages { get; set; } = [];
}

public class ChatMessage
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [ForeignKey(nameof(Conversation))]
    public Guid ConversationId           { get; set; }
    public Conversation Conversation     { get; set; } = null!;

    [ForeignKey(nameof(User))]
    public Guid SenderUserId             { get; set; }
    public User SenderUser               { get; set; } = null!;

    [Required, MaxLength(2000)]
    public string Content                { get; set; } = "";

    public bool IsRead                   { get; set; } = false;
    public DateTime SentAt               { get; set; } = DateTime.UtcNow;
}

