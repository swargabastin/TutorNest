using HomeTutorAPI.Data;
using HomeTutorAPI.Models;
using HomeTutorAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HomeTutorAPI.Repositories;

// ─── Base Repository ──────────────────────────────────────────────────────────
public class Repository<T>(AppDbContext db) : IRepository<T> where T : class
{
    protected readonly AppDbContext _db = db;
    protected readonly DbSet<T> _set = db.Set<T>();

    public async Task<T?> GetByIdAsync(object id, CancellationToken ct = default)
        => await _set.FindAsync([id], ct);

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default)
        => await _set.ToListAsync(ct);

    public async Task AddAsync(T entity, CancellationToken ct = default)
        => await _set.AddAsync(entity, ct);

    public void Update(T entity)           => _set.Update(entity);
    public void Remove(T entity)           => _set.Remove(entity);
    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}

// ─── User Repository ──────────────────────────────────────────────────────────
public class UserRepository(AppDbContext db) : Repository<User>(db), IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _set.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default)
        => await _set.FirstOrDefaultAsync(u => u.GoogleId == googleId, ct);

    public async Task<User?> GetByRefreshTokenAsync(string token, CancellationToken ct = default)
        => await _set.FirstOrDefaultAsync(u => u.RefreshToken == token, ct);

    public async Task<User?> GetByResetTokenAsync(string token, CancellationToken ct = default)
        => await _set.FirstOrDefaultAsync(u => u.ResetToken == token && u.ResetTokenExpiry > DateTime.UtcNow, ct);

    public async Task<(List<User> Items, int TotalCount)> GetPagedAsync(
        string? search, string? role, int page, int pageSize, CancellationToken ct = default)
    {
        var q = _set.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));
        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var r))
            q = q.Where(u => u.Role == r);

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(u => u.CreatedAt)
                           .Skip((page - 1) * pageSize).Take(pageSize)
                           .ToListAsync(ct);
        return (items, total);
    }
}

// ─── Tutor Repository ─────────────────────────────────────────────────────────
public class TutorRepository(AppDbContext db) : Repository<TutorProfile>(db), ITutorRepository
{
    public async Task<TutorProfile?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _set.Include(t => t.User)
                     .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
                     .FirstOrDefaultAsync(t => t.UserId == userId, ct);

    public async Task<TutorProfile?> GetWithDetailsAsync(Guid id, CancellationToken ct = default)
        => await _set
            .Include(t => t.User)
            .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
            .Include(t => t.Reviews).ThenInclude(r => r.StudentProfile).ThenInclude(sp => sp.User)
            .Include(t => t.Availabilities)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<(List<TutorProfile> Items, int TotalCount)> SearchAsync(
        string? search, string? city, string? subject, string? level,
        string[]? mode, decimal minRate, decimal maxRate, decimal minRating,
        bool verifiedOnly, string sortBy, int page, int pageSize,
        string? locality = null, string? pincode = null, string[]? boards = null,
        bool? freeDemoOnly = null,
        CancellationToken ct = default)
    {
        var q = _set
            .Include(t => t.User)
            .Include(t => t.TutorSubjects).ThenInclude(ts => ts.Subject)
            .Where(t => t.Status == TutorStatus.Approved);

        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(t => t.User.FullName.Contains(search) ||
                              t.Bio!.Contains(search) ||
                              t.TutorSubjects.Any(ts => ts.Subject.Name.Contains(search)));

        if (!string.IsNullOrWhiteSpace(city))
            q = q.Where(t => t.User.City == city);

        if (!string.IsNullOrWhiteSpace(locality))
        {
            var loc = locality.Trim();
            q = q.Where(t => (t.Locality != null && t.Locality.Contains(loc)) ||
                             (t.User.City != null && t.User.City.Contains(loc)) ||
                             t.TeachingMode == TeachingMode.Online ||
                             t.TeachingMode == TeachingMode.Both);
        }

        if (!string.IsNullOrWhiteSpace(pincode))
        {
            var pin = pincode.Trim();
            q = q.Where(t => t.Pincode == pin);
        }

        if (boards is { Length: > 0 })
        {
            q = q.Where(t => t.Boards.Any(b => boards.Contains(b)));
        }

        if (freeDemoOnly == true)
        {
            q = q.Where(t => t.OffersFreeDemo);
        }

        if (!string.IsNullOrWhiteSpace(subject))
            q = q.Where(t => t.TutorSubjects.Any(ts => ts.Subject.Name == subject));

        if (!string.IsNullOrWhiteSpace(level))
            q = q.Where(t => t.TeachingLevels.Contains(level));

        if (mode is { Length: > 0 })
        {
            var modes = mode.Select(m => Enum.Parse<TeachingMode>(m, true)).ToList();
            q = q.Where(t => modes.Contains(t.TeachingMode) || t.TeachingMode == TeachingMode.Both);
        }

        q = q.Where(t => t.HourlyRate >= minRate && t.HourlyRate <= maxRate);

        if (minRating > 0)
            q = q.Where(t => t.RatingAvg >= minRating);

        if (verifiedOnly)
            q = q.Where(t => t.IsVerified);

        q = sortBy switch
        {
            "experience" => q.OrderByDescending(t => t.ExperienceYears),
            "price-low"  => q.OrderBy(t => t.HourlyRate),
            "price-high" => q.OrderByDescending(t => t.HourlyRate),
            _            => q.OrderByDescending(t => t.RatingAvg)
        };

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task RecalculateRatingAsync(Guid tutorProfileId, CancellationToken ct = default)
    {
        var tutor = await _set.Include(t => t.Reviews)
                              .FirstOrDefaultAsync(t => t.Id == tutorProfileId, ct);
        if (tutor is null) return;

        var visible = tutor.Reviews.Where(r => r.Status == ReviewStatus.Visible).ToList();
        tutor.RatingAvg   = visible.Count > 0 ? (decimal)visible.Average(r => r.Rating) : 0;
        tutor.RatingCount = visible.Count;
        tutor.UpdatedAt   = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }
}

// ─── Student Repository ───────────────────────────────────────────────────────
public class StudentRepository(AppDbContext db) : Repository<StudentProfile>(db), IStudentRepository
{
    public async Task<StudentProfile?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _set.Include(s => s.User).FirstOrDefaultAsync(s => s.UserId == userId, ct);

    public async Task<StudentProfile?> GetWithRequirementsAsync(Guid userId, CancellationToken ct = default)
        => await _set.Include(s => s.User)
                     .Include(s => s.Requirements)
                     .FirstOrDefaultAsync(s => s.UserId == userId, ct);
}

// ─── Requirement Repository ───────────────────────────────────────────────────
public class RequirementRepository(AppDbContext db) : Repository<TuitionRequirement>(db), IRequirementRepository
{
    public async Task<List<TuitionRequirement>> GetByStudentAsync(Guid studentProfileId, CancellationToken ct = default)
        => await _set.Where(r => r.StudentProfileId == studentProfileId)
                     .OrderByDescending(r => r.CreatedAt).ToListAsync(ct);
}

// ─── Enquiry Repository ───────────────────────────────────────────────────────
public class EnquiryRepository(AppDbContext db) : Repository<Enquiry>(db), IEnquiryRepository
{
    public async Task<List<Enquiry>> GetByTutorAsync(Guid tutorProfileId, CancellationToken ct = default)
        => await _set.Include(e => e.StudentProfile).ThenInclude(sp => sp.User)
                     .Where(e => e.TutorProfileId == tutorProfileId)
                     .OrderByDescending(e => e.CreatedAt).ToListAsync(ct);

    public async Task<List<Enquiry>> GetByStudentAsync(Guid studentProfileId, CancellationToken ct = default)
        => await _set.Include(e => e.TutorProfile).ThenInclude(tp => tp.User)
                     .Where(e => e.StudentProfileId == studentProfileId)
                     .OrderByDescending(e => e.CreatedAt).ToListAsync(ct);
}

// ─── Review Repository ────────────────────────────────────────────────────────
public class ReviewRepository(AppDbContext db) : Repository<Review>(db), IReviewRepository
{
    public async Task<List<Review>> GetByTutorAsync(Guid tutorProfileId, CancellationToken ct = default)
        => await _set.Include(r => r.StudentProfile).ThenInclude(sp => sp.User)
                     .Where(r => r.TutorProfileId == tutorProfileId && r.Status == ReviewStatus.Visible)
                     .OrderByDescending(r => r.CreatedAt).ToListAsync(ct);

    public async Task<bool> HasReviewedAsync(Guid studentProfileId, Guid tutorProfileId, CancellationToken ct = default)
        => await _set.AnyAsync(r => r.StudentProfileId == studentProfileId && r.TutorProfileId == tutorProfileId, ct);
}

// ─── Payment Repository ───────────────────────────────────────────────────────
public class PaymentRepository(AppDbContext db) : Repository<Payment>(db), IPaymentRepository
{
    public async Task<Payment?> GetByRazorpayOrderIdAsync(string orderId, CancellationToken ct = default)
        => await _set.FirstOrDefaultAsync(p => p.RazorpayOrderId == orderId, ct);

    public async Task<List<Payment>> GetByUserAsync(Guid userId, CancellationToken ct = default)
        => await _set.Where(p => p.UserId == userId)
                     .OrderByDescending(p => p.CreatedAt).ToListAsync(ct);
}

// ─── CoinTransaction Repository ───────────────────────────────────────────────
public class CoinTransactionRepository(AppDbContext db) : Repository<CoinTransaction>(db), ICoinTransactionRepository
{
    public async Task<List<CoinTransaction>> GetByTutorAsync(Guid tutorProfileId, CancellationToken ct = default)
        => await _set.Where(c => c.TutorProfileId == tutorProfileId)
                     .OrderByDescending(c => c.CreatedAt).ToListAsync(ct);

    public async Task<List<CoinTransaction>> GetByStudentAsync(Guid studentProfileId, CancellationToken ct = default)
        => await _set.Where(c => c.StudentProfileId == studentProfileId)
                     .OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
}
