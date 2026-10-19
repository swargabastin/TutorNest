using HomeTutorAPI.Models;

namespace HomeTutorAPI.Repositories.Interfaces;

// ─── Generic ──────────────────────────────────────────────────────────────────
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(object id, CancellationToken ct = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
    Task SaveChangesAsync(CancellationToken ct = default);
}

// ─── Tutor ────────────────────────────────────────────────────────────────────
public interface ITutorRepository : IRepository<TutorProfile>
{
    Task<TutorProfile?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<(List<TutorProfile> Items, int TotalCount)> SearchAsync(
        string? search, string? city, string? subject, string? level,
        string[]? mode, decimal minRate, decimal maxRate, decimal minRating,
        bool verifiedOnly, string sortBy, int page, int pageSize,
        CancellationToken ct = default);
    Task<TutorProfile?> GetWithDetailsAsync(Guid tutorProfileId, CancellationToken ct = default);
    Task RecalculateRatingAsync(Guid tutorProfileId, CancellationToken ct = default);
}

// ─── Student ──────────────────────────────────────────────────────────────────
public interface IStudentRepository : IRepository<StudentProfile>
{
    Task<StudentProfile?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<StudentProfile?> GetWithRequirementsAsync(Guid userId, CancellationToken ct = default);
}

// ─── User ─────────────────────────────────────────────────────────────────────
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default);
    Task<User?> GetByRefreshTokenAsync(string token, CancellationToken ct = default);
    Task<User?> GetByResetTokenAsync(string token, CancellationToken ct = default);
    Task<(List<User> Items, int TotalCount)> GetPagedAsync(
        string? search, string? role, int page, int pageSize, CancellationToken ct = default);
}

// ─── Requirement ──────────────────────────────────────────────────────────────
public interface IRequirementRepository : IRepository<TuitionRequirement>
{
    Task<List<TuitionRequirement>> GetByStudentAsync(Guid studentProfileId, CancellationToken ct = default);
}

// ─── Enquiry ──────────────────────────────────────────────────────────────────
public interface IEnquiryRepository : IRepository<Enquiry>
{
    Task<List<Enquiry>> GetByTutorAsync(Guid tutorProfileId, CancellationToken ct = default);
    Task<List<Enquiry>> GetByStudentAsync(Guid studentProfileId, CancellationToken ct = default);
}

// ─── Review ───────────────────────────────────────────────────────────────────
public interface IReviewRepository : IRepository<Review>
{
    Task<List<Review>> GetByTutorAsync(Guid tutorProfileId, CancellationToken ct = default);
    Task<bool> HasReviewedAsync(Guid studentProfileId, Guid tutorProfileId, CancellationToken ct = default);
}

// ─── Payment ──────────────────────────────────────────────────────────────────
public interface IPaymentRepository : IRepository<Payment>
{
    Task<Payment?> GetByRazorpayOrderIdAsync(string orderId, CancellationToken ct = default);
    Task<List<Payment>> GetByUserAsync(Guid userId, CancellationToken ct = default);
}

// ─── CoinTransaction ──────────────────────────────────────────────────────────
public interface ICoinTransactionRepository : IRepository<CoinTransaction>
{
    Task<List<CoinTransaction>> GetByTutorAsync(Guid tutorProfileId, CancellationToken ct = default);
    Task<List<CoinTransaction>> GetByStudentAsync(Guid studentProfileId, CancellationToken ct = default);
}
