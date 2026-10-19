using HomeTutorAPI.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace HomeTutorAPI.Services;

public class EmailService(IConfiguration cfg, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendPasswordResetAsync(
        string toEmail, string toName, string resetLink, CancellationToken ct = default)
    {
        var subject = "Reset your HomeTutor password";
        var body    = $"""
            <h2>Password Reset Request</h2>
            <p>Hi {toName},</p>
            <p>Click the link below to reset your password. This link expires in 2 hours.</p>
            <a href="{resetLink}" style="padding:12px 24px;background:#0d9488;color:white;border-radius:6px;text-decoration:none;">
              Reset Password
            </a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            """;
        await SendAsync(toEmail, toName, subject, body, ct);
    }

    public async Task SendWelcomeAsync(
        string toEmail, string toName, CancellationToken ct = default)
    {
        var subject = "Welcome to HomeTutor!";
        var body    = $"""
            <h2>Welcome, {toName}!</h2>
            <p>Your account has been created successfully.</p>
            <p>Start exploring qualified tutors near you.</p>
            """;
        await SendAsync(toEmail, toName, subject, body, ct);
    }

    private async Task SendAsync(
        string toEmail, string toName, string subject, string htmlBody, CancellationToken ct)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                cfg["Email:SenderName"] ?? "HomeTutor",
                cfg["Email:SenderAddress"] ?? "noreply@hometutor.in"));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body    = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                cfg["Email:SmtpHost"] ?? "smtp.gmail.com",
                int.Parse(cfg["Email:SmtpPort"] ?? "587"),
                SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(
                cfg["Email:SmtpUser"], cfg["Email:SmtpPass"], ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            // Don't throw — email failure shouldn't break the request
        }
    }
}
