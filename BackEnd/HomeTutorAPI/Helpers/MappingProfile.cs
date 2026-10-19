using AutoMapper;
using HomeTutorAPI.DTOs;
using HomeTutorAPI.Models;

namespace HomeTutorAPI.Helpers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User → UserDto
        CreateMap<User, UserDto>()
            .ConstructUsing(u => new UserDto(
                u.Id, u.FullName, u.Email, u.Phone, u.City,
                u.ProfileImage, u.Role.ToString(), u.IsActive, u.CreatedAt));

        // TutorProfile → TutorListDto
        CreateMap<TutorProfile, TutorListDto>()
            .ConstructUsing((t, ctx) => new TutorListDto(
                t.Id,
                t.UserId,
                t.User.FullName,
                t.User.ProfileImage,
                t.TutorSubjects.Select(ts => ts.Subject.Name).ToArray(),
                t.ExperienceYears,
                t.RatingAvg,
                t.RatingCount,
                t.HourlyRate,
                t.User.City,
                t.TeachingMode.ToString(),
                t.Qualification,
                t.Bio ?? "",
                t.IsVerified,
                t.Languages,
                t.TeachingLevels,
                t.ResponseTime,
                t.StudentsTaught));

        // TutorProfile → TutorDetailDto
        CreateMap<TutorProfile, TutorDetailDto>()
            .ConstructUsing((t, ctx) => new TutorDetailDto(
                t.Id,
                t.UserId,
                t.User.FullName,
                t.User.ProfileImage,
                t.TutorSubjects.Select(ts => ts.Subject.Name).ToArray(),
                t.ExperienceYears,
                t.RatingAvg,
                t.RatingCount,
                t.HourlyRate,
                t.User.City,
                t.TeachingMode.ToString(),
                t.Qualification,
                t.Bio,
                t.IsVerified,
                t.Languages,
                t.TeachingLevels,
                t.ResponseTime,
                t.StudentsTaught,
                t.User.Phone,
                t.User.Email,
                t.Reviews.Select(r => ctx.Mapper.Map<ReviewDto>(r)).ToList(),
                t.Availabilities.Select(a => ctx.Mapper.Map<AvailabilityDto>(a)).ToList()));

        // Review → ReviewDto
        CreateMap<Review, ReviewDto>()
            .ConstructUsing(r => new ReviewDto(
                r.Id,
                r.StudentProfile.User.FullName,
                r.StudentProfile.User.ProfileImage,
                r.Rating,
                r.ReviewText,
                r.CreatedAt));

        // Availability → AvailabilityDto
        CreateMap<Availability, AvailabilityDto>()
            .ConstructUsing(a => new AvailabilityDto(
                a.Id,
                a.DayOfWeek.ToString(),
                a.StartTime,
                a.EndTime));

        // TuitionRequirement → RequirementDto
        CreateMap<TuitionRequirement, RequirementDto>()
            .ConstructUsing(r => new RequirementDto(
                r.Id, r.Subject, r.Level, r.City,
                r.Mode.ToString(), r.Budget, r.FrequencyPerWeek,
                r.Description, r.Status.ToString(), r.ResponseCount, r.CreatedAt));

        // Enquiry → EnquiryDto
        // NOTE: whichever controller queries this (Students vs Tutors) only
        // .Include()s the *other* party's profile (a student looking at their
        // own enquiries needs the tutor's name; a tutor looking at their leads
        // needs the student's name). Both nav properties are accessed with
        // null-safe operators so this never throws regardless of which side
        // was included, and both name fields are populated whenever that
        // side's data happens to be loaded.
        CreateMap<Enquiry, EnquiryDto>()
            .ConstructUsing(e => new EnquiryDto(
                e.Id,
                e.TutorProfileId,
                e.TutorProfile != null ? e.TutorProfile.User.FullName : null,
                e.TutorProfile != null ? e.TutorProfile.User.ProfileImage : null,
                e.StudentProfile != null ? e.StudentProfile.User.FullName : null,
                e.StudentProfile != null ? e.StudentProfile.User.ProfileImage : null,
                e.Subject,
                e.Level,
                e.Message,
                e.IsRead,
                e.CreatedAt));

        // CoinTransaction → CoinTransactionDto
        CreateMap<CoinTransaction, CoinTransactionDto>()
            .ConstructUsing(c => new CoinTransactionDto(
                c.Id, c.Type.ToString(), c.Amount,
                c.Description, c.CreatedAt, c.BalanceAfter));

        // SubscriptionPlan → SubscriptionPlanDto
        CreateMap<SubscriptionPlan, SubscriptionPlanDto>()
            .ConstructUsing(p => new SubscriptionPlanDto(
                p.Id, p.Name, p.Tier.ToString(), p.Audience.ToString(), p.Price,
                p.CoinsPerMonth, p.Features, p.IsPopular, p.DurationDays));

        // TutorVerificationDocument → TutorVerificationDocumentDto
        CreateMap<TutorVerificationDocument, TutorVerificationDocumentDto>()
            .ConstructUsing(d => new TutorVerificationDocumentDto(
                d.Id,
                d.DocType.ToString(),
                d.Status.ToString(),
                d.FileUrl,
                d.RejectionReason,
                d.CreatedAt,
                d.ReviewedAt));

        // Booking → BookingDto
        CreateMap<Booking, BookingDto>()
            .ConstructUsing(b => new BookingDto(
                b.Id,
                b.StudentProfileId,
                b.StudentProfile != null ? b.StudentProfile.User.FullName : "Student",
                b.StudentProfile != null ? b.StudentProfile.User.Email : null,
                b.StudentProfile != null ? b.StudentProfile.User.Phone : null,
                b.TutorProfileId,
                b.TutorProfile != null ? b.TutorProfile.User.FullName : "Tutor",
                b.TutorProfile != null ? b.TutorProfile.User.ProfileImage : null,
                b.Subject,
                b.Mode.ToString(),
                b.Status.ToString(),
                b.StartTime,
                b.EndTime,
                b.HourlyRate,
                b.IsTrial,
                b.MeetingLink,
                b.LocationAddress,
                b.StudentNotes,
                b.CancellationReason,
                b.CreatedAt));
    }
}
