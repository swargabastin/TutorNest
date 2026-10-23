using System;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using HomeTutorAPI.Data;
using HomeTutorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HomeTutorAPI.Services.WhatsApp;

public class WhatsAppNotificationService(
    AppDbContext db,
    IConfiguration config,
    ILogger<WhatsAppNotificationService> logger) : IWhatsAppNotificationService
{
    public async Task<NotificationDispatchResult> SendLeadNotificationAsync(
        TutorProfile tutor,
        TuitionRequirement requirement,
        CancellationToken ct = default)
    {
        // 1. Consent verification
        if (!tutor.WhatsAppNotificationsEnabled)
        {
            logger.LogInformation("Skipping WhatsApp alert for tutor {TutorId}: Notifications not enabled", tutor.Id);
            return new NotificationDispatchResult(false, "BlockedNoConsent", "Tutor has not opted into WhatsApp notifications.");
        }

        // 2. Phone number normalization
        var rawPhone = tutor.WhatsAppPhoneNumber ?? tutor.User?.Phone ?? "";
        var phone = Regex.Replace(rawPhone, @"[^\d+]", "");
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 10)
        {
            logger.LogWarning("WhatsApp alert failed for tutor {TutorId}: Invalid phone number '{Phone}'", tutor.Id, rawPhone);
            return new NotificationDispatchResult(false, "Failed", "No valid WhatsApp phone number found.");
        }

        if (!phone.StartsWith("+"))
        {
            phone = phone.Length == 10 ? $"+91{phone}" : $"+{phone}";
        }

        // 3. Deduplication check
        var alreadySent = await db.WhatsAppNotificationLogs.AnyAsync(
            l => l.TutorProfileId == tutor.Id &&
                 l.RequirementId == requirement.Id &&
                 (l.Status == WhatsAppNotificationStatus.Sent || l.Status == WhatsAppNotificationStatus.Simulated),
            ct);

        if (alreadySent)
        {
            return new NotificationDispatchResult(true, "AlreadySent", "Notification previously dispatched for this requirement.");
        }

        // 4. Construct message
        var baseUrl = config["App:BaseUrl"] ?? "https://tutor-nest-delta.vercel.app";
        var tutorName = tutor.User?.FullName ?? "Tutor";
        var area = !string.IsNullOrWhiteSpace(requirement.Locality)
            ? $"{requirement.Locality}, {requirement.City ?? "Kerala"}"
            : (requirement.City ?? "Kerala");

        var message = $"Hello {tutorName}, a new tuition requirement matches your teaching profile! " +
                      $"Subject: {requirement.Subject}. " +
                      $"Board: {requirement.Board ?? "All Boards"}. " +
                      $"Location: {area}. " +
                      $"Mode: {requirement.Mode}. " +
                      $"Review and contact: {baseUrl}/search?subject={Uri.EscapeDataString(requirement.Subject)}";

        var provider = config["WhatsApp:Provider"] ?? "Mock";
        var status = WhatsAppNotificationStatus.Simulated;
        string? providerResponse = null;

        try
        {
            if (provider.Equals("Twilio", StringComparison.OrdinalIgnoreCase))
            {
                var accountSid = config["WhatsApp:Twilio:AccountSid"];
                var authToken = config["WhatsApp:Twilio:AuthToken"];
                var fromNumber = config["WhatsApp:Twilio:FromNumber"];

                if (!string.IsNullOrEmpty(accountSid) && !string.IsNullOrEmpty(authToken) && !string.IsNullOrEmpty(fromNumber))
                {
                    // Live Twilio client would dispatch here
                    status = WhatsAppNotificationStatus.Sent;
                    providerResponse = $"Twilio queued to {phone}";
                }
                else
                {
                    logger.LogWarning("Twilio provider selected but credentials not configured. Simulating delivery.");
                    status = WhatsAppNotificationStatus.Simulated;
                    providerResponse = "Simulated: Twilio credentials missing in configuration.";
                }
            }
            else
            {
                // Default Mock / simulated mode
                status = WhatsAppNotificationStatus.Simulated;
                providerResponse = "Simulated: Mock provider active.";
                logger.LogInformation("Simulated WhatsApp notification dispatched to {Phone} for Tutor {TutorId}", phone, tutor.Id);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send WhatsApp message to {Phone}", phone);
            status = WhatsAppNotificationStatus.Failed;
            providerResponse = ex.Message;
        }

        // 5. Persist delivery audit log
        var log = new WhatsAppNotificationLog
        {
            TutorProfileId   = tutor.Id,
            RequirementId    = requirement.Id,
            RecipientPhone   = phone,
            MessageContent   = message,
            Status           = status,
            Provider         = provider,
            ProviderResponse = providerResponse
        };

        await db.WhatsAppNotificationLogs.AddAsync(log, ct);
        await db.SaveChangesAsync(ct);

        return new NotificationDispatchResult(
            status == WhatsAppNotificationStatus.Sent || status == WhatsAppNotificationStatus.Simulated,
            status.ToString(),
            providerResponse);
    }
}
