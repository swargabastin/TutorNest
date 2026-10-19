using HomeTutorAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HomeTutorAPI.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User>                 Users               => Set<User>();
    public DbSet<TutorProfile>         TutorProfiles       => Set<TutorProfile>();
    public DbSet<StudentProfile>       StudentProfiles     => Set<StudentProfile>();
    public DbSet<Subject>              Subjects            => Set<Subject>();
    public DbSet<TutorSubject>         TutorSubjects       => Set<TutorSubject>();
    public DbSet<Location>             Locations           => Set<Location>();
    public DbSet<SubscriptionPlan>     SubscriptionPlans   => Set<SubscriptionPlan>();
    public DbSet<TutorSubscription>    TutorSubscriptions  => Set<TutorSubscription>();
    public DbSet<StudentSubscription>  StudentSubscriptions => Set<StudentSubscription>();
    public DbSet<Payment>              Payments            => Set<Payment>();
    public DbSet<CoinTransaction>      CoinTransactions    => Set<CoinTransaction>();
    public DbSet<TuitionRequirement>   TuitionRequirements => Set<TuitionRequirement>();
    public DbSet<Enquiry>              Enquiries           => Set<Enquiry>();
    public DbSet<Review>               Reviews             => Set<Review>();
    public DbSet<Availability>         Availabilities      => Set<Availability>();
    public DbSet<TutorVerificationDocument> TutorVerificationDocuments => Set<TutorVerificationDocument>();
    public DbSet<Booking>              Bookings            => Set<Booking>();
    public DbSet<Conversation>         Conversations       => Set<Conversation>();
    public DbSet<ChatMessage>          ChatMessages        => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // ── User ──────────────────────────────────────────────────────────────
        mb.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.GoogleId).IsUnique().HasFilter("\"GoogleId\" IS NOT NULL");
            e.Property(u => u.Role).HasConversion<string>();
        });

        // ── TutorProfile ──────────────────────────────────────────────────────
        mb.Entity<TutorProfile>(e =>
        {
            e.HasOne(t => t.User).WithOne(u => u.TutorProfile)
             .HasForeignKey<TutorProfile>(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
            e.Property(t => t.Status).HasConversion<string>();
            e.Property(t => t.TeachingMode).HasConversion<string>();
            e.Property(t => t.Languages).HasColumnType("text[]");
            e.Property(t => t.TeachingLevels).HasColumnType("text[]");
            e.Property(t => t.HourlyRate).HasPrecision(10, 2);
            e.Property(t => t.EarningsBalance).HasPrecision(12, 2);
            e.Property(t => t.RatingAvg).HasPrecision(3, 2);
        });

        // ── StudentProfile ────────────────────────────────────────────────────
        mb.Entity<StudentProfile>(e =>
        {
            e.HasOne(s => s.User).WithOne(u => u.StudentProfile)
             .HasForeignKey<StudentProfile>(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── TutorSubject (unique constraint) ──────────────────────────────────
        mb.Entity<TutorSubject>(e =>
        {
            e.HasIndex(ts => new { ts.TutorProfileId, ts.SubjectId }).IsUnique();
        });

        // ── SubscriptionPlan ──────────────────────────────────────────────────
        mb.Entity<SubscriptionPlan>(e =>
        {
            e.Property(p => p.Tier).HasConversion<string>();
            e.Property(p => p.Audience).HasConversion<string>();
            e.Property(p => p.Price).HasPrecision(10, 2);
            e.Property(p => p.Features).HasColumnType("text[]");
        });

        // ── Payment ───────────────────────────────────────────────────────────
        mb.Entity<Payment>(e =>
        {
            e.Property(p => p.Type).HasConversion<string>();
            e.Property(p => p.Status).HasConversion<string>();
            e.Property(p => p.Amount).HasPrecision(12, 2);
        });

        // ── CoinTransaction ───────────────────────────────────────────────────
        mb.Entity<CoinTransaction>(e =>
        {
            e.Property(c => c.Type).HasConversion<string>();
        });

        // ── TuitionRequirement ────────────────────────────────────────────────
        mb.Entity<TuitionRequirement>(e =>
        {
            e.Property(r => r.Mode).HasConversion<string>();
            e.Property(r => r.Status).HasConversion<string>();
        });

        // ── Review (unique per student+tutor) ─────────────────────────────────
        mb.Entity<Review>(e =>
        {
            e.HasIndex(r => new { r.TutorProfileId, r.StudentProfileId }).IsUnique();
            e.Property(r => r.Status).HasConversion<string>();
        });

        // ── Booking ───────────────────────────────────────────────────────────
        mb.Entity<Booking>(e =>
        {
            e.Property(b => b.Mode).HasConversion<string>();
            e.Property(b => b.Status).HasConversion<string>();
            e.Property(b => b.HourlyRate).HasPrecision(10, 2);
            e.HasIndex(b => b.StudentProfileId);
            e.HasIndex(b => b.TutorProfileId);
            e.HasIndex(b => b.StartTime);
            e.HasIndex(b => b.Status);
        });

        // ── Conversation & ChatMessage ─────────────────────────────────────────
        mb.Entity<Conversation>(e =>
        {
            e.HasIndex(c => new { c.StudentProfileId, c.TutorProfileId }).IsUnique();
            e.HasIndex(c => c.LastMessageAt);
            e.HasMany(c => c.Messages)
             .WithOne(m => m.Conversation)
             .HasForeignKey(m => m.ConversationId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<ChatMessage>(e =>
        {
            e.HasIndex(m => m.ConversationId);
            e.HasIndex(m => m.SentAt);
            e.HasIndex(m => m.IsRead);
        });

        // ── Seed Data ─────────────────────────────────────────────────────────
        SeedData(mb);
    }

    private static void SeedData(ModelBuilder mb)
    {
        // Subjects
        var subjects = new[]
        {
            new Subject { Id = 1,  Name = "Mathematics",    Category = "Science" },
            new Subject { Id = 2,  Name = "Physics",        Category = "Science" },
            new Subject { Id = 3,  Name = "Chemistry",      Category = "Science" },
            new Subject { Id = 4,  Name = "Biology",        Category = "Science" },
            new Subject { Id = 5,  Name = "English",        Category = "Language" },
            new Subject { Id = 6,  Name = "Hindi",          Category = "Language" },
            new Subject { Id = 7,  Name = "Social Studies", Category = "Humanities" },
            new Subject { Id = 8,  Name = "History",        Category = "Humanities" },
            new Subject { Id = 9,  Name = "Geography",      Category = "Humanities" },
            new Subject { Id = 10, Name = "Computer Science", Category = "Technology" },
            new Subject { Id = 11, Name = "Economics",      Category = "Commerce" },
            new Subject { Id = 12, Name = "Accountancy",    Category = "Commerce" },
            new Subject { Id = 13, Name = "JEE Prep",       Category = "Competitive" },
            new Subject { Id = 14, Name = "NEET Prep",      Category = "Competitive" },
        };
        mb.Entity<Subject>().HasData(subjects);

        // Locations
        var cities = new[]
        {
            "Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata",
            "Pune","Jaipur","Ahmedabad","Surat","Lucknow","Kochi"
        };
        mb.Entity<Location>().HasData(cities.Select((c, i) =>
            new Location { Id = i + 1, City = c, State = "India", Country = "India" }).ToArray());

        // Subscription Plans
        mb.Entity<SubscriptionPlan>().HasData(
            // ── Student plans ──────────────────────────────────────────────
            new SubscriptionPlan
            {
                Id = 1, Name = "Free", Tier = SubscriptionTier.Free, Audience = PlanAudience.Both, Price = 0,
                CoinsPerMonth = 0, DurationDays = 36500, IsActive = true,
                Features = ["Basic tutor search", "View tutor profiles", "Post 2 requirements/month"]
            },
            new SubscriptionPlan
            {
                Id = 2, Name = "Basic", Tier = SubscriptionTier.Basic, Audience = PlanAudience.Student, Price = 299,
                CoinsPerMonth = 500, DurationDays = 30, IsActive = true,
                Features = ["500 coins/month", "Unlimited tutor search", "Post 10 requirements/month", "Email support"]
            },
            new SubscriptionPlan
            {
                Id = 3, Name = "Pro", Tier = SubscriptionTier.Pro, Audience = PlanAudience.Student, Price = 599,
                CoinsPerMonth = 1000, DurationDays = 30, IsActive = true, IsPopular = true,
                Features = ["1000 coins/month", "Unlimited everything", "Priority matching", "Phone support", "Featured in search"]
            },
            new SubscriptionPlan
            {
                Id = 4, Name = "Premium", Tier = SubscriptionTier.Premium, Audience = PlanAudience.Student, Price = 999,
                CoinsPerMonth = 2500, DurationDays = 30, IsActive = true,
                Features = ["2500 coins/month", "Unlimited everything", "Dedicated manager", "24/7 support", "Top placement", "Analytics dashboard"]
            },
            // ── Tutor plans ────────────────────────────────────────────────
            new SubscriptionPlan
            {
                Id = 5, Name = "Tutor Basic", Tier = SubscriptionTier.Basic, Audience = PlanAudience.Tutor, Price = 499,
                CoinsPerMonth = 300, DurationDays = 30, IsActive = true,
                Features = ["Profile listing", "View 20 requirements/month", "300 coins/month", "Basic support"]
            },
            new SubscriptionPlan
            {
                Id = 6, Name = "Tutor Professional", Tier = SubscriptionTier.Pro, Audience = PlanAudience.Tutor, Price = 999,
                CoinsPerMonth = 800, DurationDays = 30, IsActive = true, IsPopular = true,
                Features = ["Featured profile listing", "Unlimited requirements", "Priority in search results", "800 coins/month", "Verified badge", "Priority support"]
            },
            new SubscriptionPlan
            {
                Id = 7, Name = "Tutor Premium", Tier = SubscriptionTier.Premium, Audience = PlanAudience.Tutor, Price = 1499,
                CoinsPerMonth = 1500, DurationDays = 30, IsActive = true,
                Features = ["Everything in Professional", "Top of search results", "1500 coins/month", "Custom profile URL", "Dedicated account manager"]
            }
        );
    }
}
