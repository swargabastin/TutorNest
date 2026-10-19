import LegalPageLayout from "@/components/LegalPageLayout";

const LAST_UPDATED = "August 24, 2026";

const sections = [
  { id: "student-bookings", title: "1. Student Lesson Bookings" },
  { id: "subscriptions", title: "2. Tutor Subscription & Coins" },
  { id: "how-processed", title: "3. How Refunds Are Processed" },
  { id: "non-refundable", title: "4. Non-Refundable Situations" },
  { id: "how-to-request", title: "5. How to Request a Refund" },
  { id: "contact", title: "6. Contact" },
];

export const metadata = {
  title: "Refund & Cancellation Policy | HomeTutor (TutorNest)",
  description: "HomeTutor's refund and cancellation rules for lesson bookings, coin packages, and tutor subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund & Cancellation Policy"
      lastUpdated={LAST_UPDATED}
      sections={sections}
    >
      <p>
        This policy applies to all payments made on the HomeTutor Platform, operated
        by <strong>HomeTutor EdTech Private Limited</strong>, and covers Student lesson
        bookings, coin package purchases, and Tutor subscription plans.
      </p>

      <h2 id="student-bookings">1. Student Lesson Bookings</h2>

      <h3>1.1 Cancelling before the lesson</h3>
      <ul>
        <li>
          <strong>More than 24 hours before the scheduled lesson:</strong> Full refund
          to your original payment method, processed within 5–7 business days.
        </li>
        <li>
          <strong>Less than 24 hours before the scheduled lesson:</strong> 50% refund,
          to compensate the tutor for holding the reserved time slot.
        </li>
        <li>
          <strong>Tutor cancels, for any reason:</strong> 100% full refund automatically credited back to your account, or the option to rebook with another tutor at no additional cost.
        </li>
      </ul>

      <h3>1.2 First lesson / trial policy</h3>
      <p>
        If a preliminary consultation or trial session is offered by a tutor free of charge, it is not subject to monetary charges or refund procedures.
      </p>

      <h3>1.3 No-shows</h3>
      <ul>
        <li>
          <strong>Student no-show:</strong> If a student fails to attend a confirmed lesson without prior notice, no refund is issued since the tutor reserved the time.
        </li>
        <li>
          <strong>Tutor no-show:</strong> Full refund processed automatically. Repeated tutor no-shows may lead to suspension or removal of the tutor profile from the Platform.
        </li>
      </ul>

      <h3>1.4 Quality disputes</h3>
      <p>
        If a lesson did not meet reasonable quality standards (e.g., tutor was unprepared,
        session was significantly cut short), please contact support within 48 hours of the
        session. Our grievance team will review the interaction logs and issue an appropriate partial or full refund at our discretion.
      </p>

      <h2 id="subscriptions">2. Tutor Subscription &amp; Coin Packages</h2>
      <ul>
        <li>
          Subscription fees for tutor visibility/feature plans (₹499 / ₹999 / ₹1499 tiers)
          are <strong>non-refundable once the billing cycle begins</strong>, as account privileges and search boosts activate immediately.
        </li>
        <li>
          You may cancel subscription auto-renewal anytime through your tutor dashboard; cancellation takes effect at the end of the current billing cycle.
        </li>
        <li>
          Coin packages purchased for unlocking requirement leads are non-refundable once any portion of the purchased coins has been spent.
        </li>
        <li>
          In the event of duplicate billing or erroneous technical charges, a full refund will be processed within 5–7 business days upon verification.
        </li>
      </ul>

      <h2 id="how-processed">3. How Refunds Are Processed</h2>
      <ul>
        <li>All eligible refunds are issued back to the original source payment method through Razorpay.</li>
        <li>
          Refund initiation is handled within 24–48 hours; depending on your bank or card issuer, funds typically reflect in your account within 5–7 business days.
        </li>
        <li>An email confirmation with the refund reference ID will be sent upon processing.</li>
      </ul>

      <h2 id="non-refundable">4. Non-Refundable Situations</h2>
      <ul>
        <li>Completed sessions that occurred as scheduled without any dispute logged within 48 hours.</li>
        <li>Subscription plans after services have commenced.</li>
        <li>Payments transacted directly between users outside the Platform (such transactions are strictly outside HomeTutor&apos;s escrow and coverage).</li>
      </ul>

      <h2 id="how-to-request">5. How to Request a Refund</h2>
      <p>
        To request a refund, email our payments support team at <strong>support@tutornest.com</strong> with:
      </p>
      <ul>
        <li>Your Registered Email and Phone Number</li>
        <li>Payment Transaction ID / Razorpay Payment ID</li>
        <li>Detailed reason for the refund request</li>
      </ul>
      <p>Our team aims to evaluate and respond to all refund inquiries within 48 business hours.</p>

      <h2 id="contact">6. Contact</h2>
      <p>For questions or assistance regarding refunds and cancellations, contact: <strong>support@tutornest.com</strong></p>
    </LegalPageLayout>
  );
}
