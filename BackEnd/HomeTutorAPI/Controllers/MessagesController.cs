using AutoMapper;
using HomeTutorAPI.Data;
using HomeTutorAPI.DTOs;
using HomeTutorAPI.Models;
using HomeTutorAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HomeTutorAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class MessagesController(
    AppDbContext       db,
    IStudentRepository studentRepo,
    ITutorRepository   tutorRepo,
    IUserRepository    userRepo) : ControllerBase
{
    // ── GET /api/messages/conversations ────────────────────────────────────────
    [HttpGet("conversations")]
    [ProducesResponseType(typeof(List<ConversationDto>), 200)]
    public async Task<IActionResult> GetConversations(CancellationToken ct)
    {
        var userId = GetUserId();
        var student = await studentRepo.GetByUserIdAsync(userId, ct);
        var tutor   = await tutorRepo.GetByUserIdAsync(userId, ct);

        if (student is null && tutor is null)
            return Ok(new List<ConversationDto>());

        var query = db.Conversations
            .Include(c => c.StudentProfile).ThenInclude(s => s.User)
            .Include(c => c.TutorProfile).ThenInclude(t => t.User)
            .Include(c => c.Messages)
            .AsQueryable();

        if (tutor is not null)
            query = query.Where(c => c.TutorProfileId == tutor.Id);
        else if (student is not null)
            query = query.Where(c => c.StudentProfileId == student.Id);

        var list = await query.OrderByDescending(c => c.LastMessageAt).ToListAsync(ct);

        var dtos = list.Select(c =>
        {
            var lastMsg = c.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();
            var unread = c.Messages.Count(m => !m.IsRead && m.SenderUserId != userId);

            return new ConversationDto(
                c.Id,
                c.StudentProfileId,
                c.StudentProfile.User.FullName,
                c.StudentProfile.User.ProfileImage,
                c.TutorProfileId,
                c.TutorProfile.User.FullName,
                c.TutorProfile.User.ProfileImage,
                c.Subject,
                lastMsg?.Content,
                c.LastMessageAt,
                unread,
                c.CreatedAt
            );
        }).ToList();

        return Ok(dtos);
    }

    // ── POST /api/messages/start ───────────────────────────────────────────────
    [HttpPost("start")]
    [ProducesResponseType(typeof(ConversationDto), 200)]
    public async Task<IActionResult> StartConversation(
        [FromBody] StartConversationRequest req, CancellationToken ct)
    {
        var userId = GetUserId();
        var student = await studentRepo.GetByUserIdAsync(userId, ct);
        if (student is null)
            return BadRequest(new MessageResponse("Only students can start a conversation.", false));

        var tutor = await tutorRepo.GetByIdAsync(req.TutorProfileId, ct);
        if (tutor is null)
            return NotFound(new MessageResponse("Tutor profile not found.", false));

        // Find existing conversation or create new
        var conv = await db.Conversations
            .Include(c => c.StudentProfile).ThenInclude(s => s.User)
            .Include(c => c.TutorProfile).ThenInclude(t => t.User)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c =>
                c.StudentProfileId == student.Id &&
                c.TutorProfileId == tutor.Id, ct);

        if (conv is null)
        {
            conv = new Conversation
            {
                StudentProfileId = student.Id,
                TutorProfileId   = tutor.Id,
                Subject          = req.Subject,
                LastMessageAt    = DateTime.UtcNow,
                CreatedAt        = DateTime.UtcNow
            };
            await db.Conversations.AddAsync(conv, ct);
            await db.SaveChangesAsync(ct);

            // Re-load with navigations
            conv = await db.Conversations
                .Include(c => c.StudentProfile).ThenInclude(s => s.User)
                .Include(c => c.TutorProfile).ThenInclude(t => t.User)
                .Include(c => c.Messages)
                .FirstAsync(c => c.Id == conv.Id, ct);
        }

        if (!string.IsNullOrWhiteSpace(req.InitialMessage))
        {
            var msg = new ChatMessage
            {
                ConversationId = conv.Id,
                SenderUserId   = userId,
                Content        = req.InitialMessage.Trim(),
                SentAt         = DateTime.UtcNow
            };
            conv.LastMessageAt = msg.SentAt;
            await db.ChatMessages.AddAsync(msg, ct);
            await db.SaveChangesAsync(ct);
        }

        var lastMsg = conv.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();

        return Ok(new ConversationDto(
            conv.Id,
            conv.StudentProfileId,
            conv.StudentProfile.User.FullName,
            conv.StudentProfile.User.ProfileImage,
            conv.TutorProfileId,
            conv.TutorProfile.User.FullName,
            conv.TutorProfile.User.ProfileImage,
            conv.Subject,
            lastMsg?.Content ?? req.InitialMessage,
            conv.LastMessageAt,
            0,
            conv.CreatedAt
        ));
    }

    // ── GET /api/messages/conversations/{id} ───────────────────────────────────
    [HttpGet("conversations/{id:guid}")]
    [ProducesResponseType(typeof(List<ChatMessageDto>), 200)]
    public async Task<IActionResult> GetMessages(Guid id, CancellationToken ct)
    {
        var conv = await db.Conversations
            .Include(c => c.StudentProfile)
            .Include(c => c.TutorProfile)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (conv is null)
            return NotFound(new MessageResponse("Conversation not found.", false));

        var userId = GetUserId();
        var isParticipant = conv.StudentProfile.UserId == userId || conv.TutorProfile.UserId == userId;
        if (!isParticipant && !User.IsInRole("Admin"))
            return Forbid();

        // Mark unread messages as read
        var unread = await db.ChatMessages
            .Where(m => m.ConversationId == id && !m.IsRead && m.SenderUserId != userId)
            .ToListAsync(ct);

        if (unread.Count > 0)
        {
            foreach (var m in unread) m.IsRead = true;
            await db.SaveChangesAsync(ct);
        }

        var messages = await db.ChatMessages
            .Where(m => m.ConversationId == id)
            .Include(m => m.SenderUser)
            .OrderBy(m => m.SentAt)
            .ToListAsync(ct);

        var dtos = messages.Select(m => new ChatMessageDto(
            m.Id,
            m.ConversationId,
            m.SenderUserId,
            m.SenderUser.FullName,
            m.SenderUser.ProfileImage,
            m.Content,
            m.IsRead,
            m.SentAt
        )).ToList();

        return Ok(dtos);
    }

    // ── POST /api/messages/conversations/{id} ──────────────────────────────────
    [HttpPost("conversations/{id:guid}")]
    [ProducesResponseType(typeof(ChatMessageDto), 200)]
    public async Task<IActionResult> SendMessage(
        Guid id, [FromBody] SendChatMessageRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(new MessageResponse("Message cannot be empty.", false));

        var conv = await db.Conversations
            .Include(c => c.StudentProfile)
            .Include(c => c.TutorProfile)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (conv is null)
            return NotFound(new MessageResponse("Conversation not found.", false));

        var userId = GetUserId();
        var isParticipant = conv.StudentProfile.UserId == userId || conv.TutorProfile.UserId == userId;
        if (!isParticipant && !User.IsInRole("Admin"))
            return Forbid();

        var user = await userRepo.GetByIdAsync(userId, ct);

        var msg = new ChatMessage
        {
            ConversationId = conv.Id,
            SenderUserId   = userId,
            Content        = req.Content.Trim(),
            SentAt         = DateTime.UtcNow
        };

        conv.LastMessageAt = msg.SentAt;
        await db.ChatMessages.AddAsync(msg, ct);
        await db.SaveChangesAsync(ct);

        return Ok(new ChatMessageDto(
            msg.Id,
            msg.ConversationId,
            msg.SenderUserId,
            user?.FullName ?? "User",
            user?.ProfileImage,
            msg.Content,
            false,
            msg.SentAt
        ));
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
