using System.Threading;
using System.Threading.Tasks;
using HomeTutorAPI.Models;

namespace HomeTutorAPI.Services.WhatsApp;

public record NotificationDispatchResult(
    bool Success,
    string Status,
    string? ErrorMessage = null
);

public interface IWhatsAppNotificationService
{
    Task<NotificationDispatchResult> SendLeadNotificationAsync(
        TutorProfile tutor,
        TuitionRequirement requirement,
        CancellationToken ct = default);
}
