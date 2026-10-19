using AutoMapper;
using HomeTutorAPI.Data;
using HomeTutorAPI.DTOs;
using HomeTutorAPI.Models;
using HomeTutorAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace HomeTutorAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class PaymentsController(
    IPaymentRepository paymentRepo,
    IStudentRepository studentRepo,
    ITutorRepository   tutorRepo,
    AppDbContext       db,
    IMapper            mapper,
    IConfiguration     cfg) : ControllerBase
{
    // ── GET /api/payments/plans ────────────────────────────────────────────────
    // Optional ?audience=Student|Tutor filters to plans meant for that role
    // (plans with Audience == Both are always included). Anonymous callers
    // (e.g. the public pricing page before login) can pass whichever audience
    // they're browsing as.
    [HttpGet("plans")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<SubscriptionPlanDto>), 200)]
    public async Task<IActionResult> GetPlans([FromQuery] string? audience, CancellationToken ct)
    {
        var query = db.SubscriptionPlans.Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(audience) &&
            Enum.TryParse<PlanAudience>(audience, true, out var parsedAudience))
        {
            query = query.Where(p => p.Audience == parsedAudience || p.Audience == PlanAudience.Both);
        }

        var plans = await query.OrderBy(p => p.Price).ToListAsync(ct);

        return Ok(plans.Select(mapper.Map<SubscriptionPlanDto>));
    }

    // ── GET /api/payments/coin-packages ───────────────────────────────────────
    [HttpGet("coin-packages")]
    [AllowAnonymous]
    public IActionResult GetCoinPackages()
    {
        var packages = new[]
        {
            new CoinPackageDto(100,   99,   false),
            new CoinPackageDto(500,   449,  false),
            new CoinPackageDto(1000,  849,  true),
            new CoinPackageDto(2500,  1999, false),
            new CoinPackageDto(5000,  3799, false),
            new CoinPackageDto(10000, 6999, false),
        };
        return Ok(packages);
    }

    // ── POST /api/payments/create-order ───────────────────────────────────────
    [HttpPost("create-order")]
    [ProducesResponseType(typeof(RazorpayOrderResponse), 200)]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateRazorpayOrderRequest req, CancellationToken ct)
    {
        decimal amount;

        if (req.PlanId.HasValue)
        {
            var plan = await db.SubscriptionPlans.FindAsync([req.PlanId.Value], ct);
            if (plan is null) return NotFound(new MessageResponse("Plan not found.", false));

            // Enforce that the plan's audience matches the caller's actual
            // role. This is checked server-side (not just hidden in the
            // frontend) so a student can't purchase a tutor-only plan (or
            // vice versa) by calling the API directly.
            var userId      = GetUserId();
            var callerTutor = await tutorRepo.GetByUserIdAsync(userId, ct);
            var isTutor     = callerTutor is not null;

            var allowedForCaller =
                plan.Audience == PlanAudience.Both ||
                (plan.Audience == PlanAudience.Tutor && isTutor) ||
                (plan.Audience == PlanAudience.Student && !isTutor);

            if (!allowedForCaller)
            {
                return BadRequest(new MessageResponse(
                    $"This plan is only available to {plan.Audience}s.", false));
            }

            amount = plan.Price;
        }
        else if (req.CoinPackageAmount.HasValue)
        {
            amount = req.CoinPackageAmount.Value;
        }
        else
        {
            return BadRequest(new MessageResponse("Provide either PlanId or CoinPackageAmount.", false));
        }

        var key    = cfg["Razorpay:KeyId"]!;
        var secret = cfg["Razorpay:KeySecret"]!;
        var client = new RazorpayClient(key, secret);

        var orderOptions = new Dictionary<string, object>
        {
            ["amount"]   = (int)(amount * 100), // paise
            ["currency"] = "INR",
            ["receipt"]  = $"receipt_{Guid.NewGuid():N}"
        };

        var order = client.Order.Create(orderOptions);

        // Track pending payment
        var payment = new Models.Payment
        {
            UserId           = GetUserId(),
            Type             = req.PlanId.HasValue ? PaymentType.Subscription : PaymentType.CoinPurchase,
            Amount           = amount,
            RazorpayOrderId  = order["id"].ToString(),
            CoinsAwarded     = req.CoinPackageAmount,
        };
        await paymentRepo.AddAsync(payment, ct);
        await paymentRepo.SaveChangesAsync(ct);

        return Ok(new RazorpayOrderResponse(order["id"].ToString()!, amount, "INR", key));
    }

    // ── POST /api/payments/verify ──────────────────────────────────────────────
    [HttpPost("verify")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    public async Task<IActionResult> VerifyPayment(
        [FromBody] VerifyPaymentRequest req, CancellationToken ct)
    {
        // 1. Verify Razorpay signature
        var expectedSig = ComputeHmacSha256(
            $"{req.RazorpayOrderId}|{req.RazorpayPaymentId}",
            cfg["Razorpay:KeySecret"]!);

        if (expectedSig != req.RazorpaySignature)
            return BadRequest(new MessageResponse("Payment signature verification failed.", false));

        // 2. Find the payment record
        var payment = await paymentRepo.GetByRazorpayOrderIdAsync(req.RazorpayOrderId, ct);
        if (payment is null)
            return NotFound(new MessageResponse("Payment record not found.", false));

        payment.RazorpayPaymentId = req.RazorpayPaymentId;
        payment.RazorpaySignature = req.RazorpaySignature;
        payment.Status            = PaymentStatus.Success;
        payment.UpdatedAt         = DateTime.UtcNow;
        paymentRepo.Update(payment);

        var userId = GetUserId();

        // 3. Handle subscription
        if (req.PaymentType == "subscription" && req.PlanId.HasValue)
        {
            var plan = await db.SubscriptionPlans.FindAsync([req.PlanId.Value], ct);
            if (plan is null) return NotFound();

            // Determine if tutor or student
            var tutor   = await tutorRepo.GetByUserIdAsync(userId, ct);
            var student = await studentRepo.GetByUserIdAsync(userId, ct);

            if (tutor is not null)
            {
                await db.TutorSubscriptions.AddAsync(new TutorSubscription
                {
                    TutorProfileId = tutor.Id,
                    PlanId         = plan.Id,
                    PaymentId      = payment.Id,
                    StartsAt       = DateTime.UtcNow,
                    ExpiresAt      = DateTime.UtcNow.AddDays(plan.DurationDays)
                }, ct);

                // Credit coins
                await CreditCoins(tutor, plan.CoinsPerMonth,
                    $"{plan.Name} subscription coins", payment.Id, ct);
            }
            else if (student is not null)
            {
                await db.StudentSubscriptions.AddAsync(new StudentSubscription
                {
                    StudentProfileId = student.Id,
                    PlanId           = plan.Id,
                    PaymentId        = payment.Id,
                    StartsAt         = DateTime.UtcNow,
                    ExpiresAt        = DateTime.UtcNow.AddDays(plan.DurationDays)
                }, ct);

                student.CoinBalance += plan.CoinsPerMonth;
                await db.CoinTransactions.AddAsync(new CoinTransaction
                {
                    StudentProfileId = student.Id,
                    Type             = TransactionType.Credit,
                    Amount           = plan.CoinsPerMonth,
                    BalanceAfter     = student.CoinBalance,
                    Description      = $"{plan.Name} subscription coins",
                    ReferenceId      = payment.Id,
                }, ct);
            }
        }
        // 4. Handle coin purchase
        else if (req.PaymentType == "coin_purchase" && req.CoinsAmount.HasValue)
        {
            var tutor   = await tutorRepo.GetByUserIdAsync(userId, ct);
            var student = await studentRepo.GetByUserIdAsync(userId, ct);

            if (tutor is not null)
                await CreditCoins(tutor, req.CoinsAmount.Value,
                    "Coin purchase", payment.Id, ct);
            else if (student is not null)
            {
                student.CoinBalance += req.CoinsAmount.Value;
                await db.CoinTransactions.AddAsync(new CoinTransaction
                {
                    StudentProfileId = student.Id,
                    Type             = TransactionType.Credit,
                    Amount           = req.CoinsAmount.Value,
                    BalanceAfter     = student.CoinBalance,
                    Description      = "Coin purchase",
                    ReferenceId      = payment.Id,
                }, ct);
            }
        }

        await db.SaveChangesAsync(ct);
        return Ok(new MessageResponse("Payment verified and coins credited."));
    }

    // ── POST /api/payments/webhook ─────────────────────────────────────────────
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleWebhook(CancellationToken ct)
    {
        // 1. Read raw body directly from stream (never parse then re-serialize)
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var rawBody = await reader.ReadToEndAsync(ct);

        var signatureHeader = Request.Headers["X-Razorpay-Signature"].ToString();
        var webhookSecret = cfg["Razorpay:WebhookSecret"];

        if (string.IsNullOrWhiteSpace(signatureHeader) || string.IsNullOrWhiteSpace(webhookSecret))
        {
            return BadRequest(new MessageResponse("Missing signature or webhook secret configuration.", false));
        }

        // 2. Validate HMAC-SHA256 signature
        var expectedSig = ComputeHmacSha256(rawBody, webhookSecret);
        if (expectedSig != signatureHeader)
        {
            return BadRequest(new MessageResponse("Invalid webhook signature.", false));
        }

        // 3. Parse JSON event
        using var doc = System.Text.Json.JsonDocument.Parse(rawBody);
        var root = doc.RootElement;
        var eventType = root.GetProperty("event").GetString();

        // We handle payment.captured and order.paid
        if (eventType is "payment.captured" or "order.paid")
        {
            if (root.TryGetProperty("payload", out var payload) &&
                payload.TryGetProperty("payment", out var paymentProp) &&
                paymentProp.TryGetProperty("entity", out var paymentEntity))
            {
                var razorpayPaymentId = paymentEntity.GetProperty("id").GetString();
                var razorpayOrderId = paymentEntity.TryGetProperty("order_id", out var orderIdProp) ? orderIdProp.GetString() : null;

                if (!string.IsNullOrEmpty(razorpayOrderId))
                {
                    var payment = await paymentRepo.GetByRazorpayOrderIdAsync(razorpayOrderId, ct);
                    if (payment is not null && payment.Status != PaymentStatus.Success)
                    {
                        payment.RazorpayPaymentId = razorpayPaymentId;
                        payment.RazorpaySignature = signatureHeader;
                        payment.Status = PaymentStatus.Success;
                        payment.UpdatedAt = DateTime.UtcNow;
                        paymentRepo.Update(payment);

                        await FulfillPaymentAsync(payment, ct);
                        await db.SaveChangesAsync(ct);
                    }
                }
            }
        }

        // 4. Return fast 200 OK within 5 seconds
        return Ok(new { status = "processed" });
    }

    private async Task FulfillPaymentAsync(Models.Payment payment, CancellationToken ct)
    {
        var tutor = await tutorRepo.GetByUserIdAsync(payment.UserId, ct);
        var student = await studentRepo.GetByUserIdAsync(payment.UserId, ct);

        if (payment.Type == PaymentType.Subscription)
        {
            // Find existing active plan matching amount or matching pending subscription
            var plan = await db.SubscriptionPlans.FirstOrDefaultAsync(p => p.Price == payment.Amount && p.IsActive, ct);
            if (plan is not null)
            {
                if (tutor is not null)
                {
                    var hasExisting = await db.TutorSubscriptions.AnyAsync(s => s.PaymentId == payment.Id, ct);
                    if (!hasExisting)
                    {
                        await db.TutorSubscriptions.AddAsync(new TutorSubscription
                        {
                            TutorProfileId = tutor.Id,
                            PlanId = plan.Id,
                            PaymentId = payment.Id,
                            StartsAt = DateTime.UtcNow,
                            ExpiresAt = DateTime.UtcNow.AddDays(plan.DurationDays)
                        }, ct);

                        await CreditCoins(tutor, plan.CoinsPerMonth, $"{plan.Name} subscription coins", payment.Id, ct);
                    }
                }
                else if (student is not null)
                {
                    var hasExisting = await db.StudentSubscriptions.AnyAsync(s => s.PaymentId == payment.Id, ct);
                    if (!hasExisting)
                    {
                        await db.StudentSubscriptions.AddAsync(new StudentSubscription
                        {
                            StudentProfileId = student.Id,
                            PlanId = plan.Id,
                            PaymentId = payment.Id,
                            StartsAt = DateTime.UtcNow,
                            ExpiresAt = DateTime.UtcNow.AddDays(plan.DurationDays)
                        }, ct);

                        student.CoinBalance += plan.CoinsPerMonth;
                        await db.CoinTransactions.AddAsync(new CoinTransaction
                        {
                            StudentProfileId = student.Id,
                            Type = TransactionType.Credit,
                            Amount = plan.CoinsPerMonth,
                            BalanceAfter = student.CoinBalance,
                            Description = $"{plan.Name} subscription coins",
                            ReferenceId = payment.Id,
                        }, ct);
                    }
                }
            }
        }
        else if (payment.Type == PaymentType.CoinPurchase && payment.CoinsAwarded.HasValue)
        {
            var alreadyAwarded = await db.CoinTransactions.AnyAsync(t => t.ReferenceId == payment.Id, ct);
            if (!alreadyAwarded)
            {
                if (tutor is not null)
                {
                    await CreditCoins(tutor, payment.CoinsAwarded.Value, "Coin purchase", payment.Id, ct);
                }
                else if (student is not null)
                {
                    student.CoinBalance += payment.CoinsAwarded.Value;
                    await db.CoinTransactions.AddAsync(new CoinTransaction
                    {
                        StudentProfileId = student.Id,
                        Type = TransactionType.Credit,
                        Amount = payment.CoinsAwarded.Value,
                        BalanceAfter = student.CoinBalance,
                        Description = "Coin purchase",
                        ReferenceId = payment.Id,
                    }, ct);
                }
            }
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────
    private async Task CreditCoins(TutorProfile tutor, int coins,
        string description, Guid paymentId, CancellationToken ct)
    {
        tutor.CoinBalance += coins;
        await db.CoinTransactions.AddAsync(new CoinTransaction
        {
            TutorProfileId = tutor.Id,
            Type           = TransactionType.Credit,
            Amount         = coins,
            BalanceAfter   = tutor.CoinBalance,
            Description    = description,
            ReferenceId    = paymentId,
        }, ct);
    }

    private static string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLower();
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
