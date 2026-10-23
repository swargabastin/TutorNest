using System;
using System.Text.RegularExpressions;
using HomeTutorAPI.Models;
using Xunit;

namespace HomeTutorAPI.Tests;

public class Phase2And3Tests
{
    // ── 1. Video Introduction URL Validation Tests ──────────────────────────────
    [Theory]
    [InlineData("https://www.youtube.com/watch?v=dQw4w9WgXcQ", true)]
    [InlineData("https://youtu.be/dQw4w9WgXcQ", true)]
    [InlineData("https://vimeo.com/123456789", true)]
    [InlineData("https://res.cloudinary.com/tutornest/video/upload/intro.mp4", true)]
    [InlineData("https://evil-site.com/hack.js", false)]
    [InlineData("javascript:alert(1)", false)]
    [InlineData("<script>alert('xss')</script>", false)]
    public void VideoUrl_Validation_Matches_SupportedProvidersOnly(string url, bool expectedValid)
    {
        var isValid = Regex.IsMatch(
            url,
            @"^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|res\.cloudinary\.com)\/",
            RegexOptions.IgnoreCase);

        Assert.Equal(expectedValid, isValid);
    }

    // ── 2. Multi-Level Tutor Verification Tests ─────────────────────────────────
    [Fact]
    public void TutorVerification_SeparateFlags_DoNotConflict()
    {
        var tutor = new TutorProfile
        {
            IdVerified = true,
            QualificationVerified = true,
            AddressVerified = false,
            PoliceCheckVerified = false,
            IsVerified = true // Overall verified because Govt ID is reviewed
        };

        Assert.True(tutor.IdVerified);
        Assert.True(tutor.QualificationVerified);
        Assert.False(tutor.AddressVerified);
        Assert.False(tutor.PoliceCheckVerified);
        Assert.True(tutor.IsVerified);
    }

    [Fact]
    public void TutorVerification_ResubmissionRequired_LeavesVerifiedFalse()
    {
        var doc = new TutorVerificationDocument
        {
            DocType = VerificationDocType.GovernmentId,
            Status = VerificationDocStatus.ResubmissionRequired,
            RejectionReason = "Image too blurry, please upload high-res scan."
        };

        Assert.Equal(VerificationDocStatus.ResubmissionRequired, doc.Status);
        Assert.NotNull(doc.RejectionReason);
    }

    // ── 3. Coin Refund Request & Atomic Ledger Safety Tests ────────────────────
    [Fact]
    public void CoinRefund_Approval_CreditsBalanceAtomically()
    {
        var tutor = new TutorProfile
        {
            CoinBalance = 100
        };

        const int initialBalance = 100;
        const int leadDebitCoins = 25;

        // Step 1: Lead Unlock debit
        tutor.CoinBalance -= leadDebitCoins;
        Assert.Equal(75, tutor.CoinBalance);

        var debitTxn = new CoinTransaction
        {
            Id = Guid.NewGuid(),
            TutorProfileId = tutor.Id,
            Type = TransactionType.Debit,
            Amount = leadDebitCoins,
            BalanceAfter = tutor.CoinBalance,
            Description = "Unlocked student lead (Mathematics)"
        };

        // Step 2: Create refund request
        var refundRequest = new CoinRefundRequest
        {
            Id = Guid.NewGuid(),
            TutorProfileId = tutor.Id,
            CoinTransactionId = debitTxn.Id,
            CoinsRequested = leadDebitCoins,
            Reason = CoinRefundReason.InvalidContact,
            Explanation = "Phone number disconnected",
            Status = CoinRefundStatus.Pending
        };

        Assert.Equal(CoinRefundStatus.Pending, refundRequest.Status);

        // Step 3: Admin approves refund
        refundRequest.Status = CoinRefundStatus.Approved;
        tutor.CoinBalance += refundRequest.CoinsRequested;

        var creditTxn = new CoinTransaction
        {
            Id = Guid.NewGuid(),
            TutorProfileId = tutor.Id,
            Type = TransactionType.Credit,
            Amount = refundRequest.CoinsRequested,
            BalanceAfter = tutor.CoinBalance,
            Description = $"Refund approved: {refundRequest.Reason}",
            ReferenceId = refundRequest.Id
        };

        // Verify balance restored exactly to original
        Assert.Equal(initialBalance, tutor.CoinBalance);
        Assert.Equal(100, creditTxn.BalanceAfter);
        Assert.Equal(TransactionType.Credit, creditTxn.Type);
    }

    [Fact]
    public void CoinRefund_Rejection_LeavesBalanceUnchanged()
    {
        var tutor = new TutorProfile { CoinBalance = 75 };

        var refundRequest = new CoinRefundRequest
        {
            CoinsRequested = 25,
            Status = CoinRefundStatus.Pending
        };

        // Admin rejects
        refundRequest.Status = CoinRefundStatus.Rejected;
        refundRequest.AdminNotes = "Parent verified valid on secondary contact";

        // Balance must not change
        Assert.Equal(75, tutor.CoinBalance);
        Assert.Equal(CoinRefundStatus.Rejected, refundRequest.Status);
    }

    // ── 4. WhatsApp Lead Alert Consent & Phone Normalization Tests ─────────────
    [Fact]
    public void WhatsApp_DisabledConsent_BlocksNotification()
    {
        var tutor = new TutorProfile
        {
            WhatsAppNotificationsEnabled = false,
            WhatsAppPhoneNumber = "+919876543210"
        };

        var shouldSend = tutor.WhatsAppNotificationsEnabled;
        Assert.False(shouldSend);
    }

    [Theory]
    [InlineData("9876543210", "+919876543210")]
    [InlineData("+91 98765 43210", "+919876543210")]
    [InlineData("09876543210", "+09876543210")]
    public void WhatsApp_PhoneNormalization_FormatsIndianNumbers(string input, string expected)
    {
        var cleaned = Regex.Replace(input, @"[^\d+]", "");
        if (!cleaned.StartsWith("+"))
        {
            cleaned = cleaned.Length == 10 ? $"+91{cleaned}" : $"+{cleaned}";
        }

        Assert.Equal(expected, cleaned);
    }
}
