import LegalPageLayout from "@/components/LegalPageLayout";

const LAST_UPDATED = "August 24, 2026";

const sections = [
  { id: "what-hometutor-is", title: "1. What HomeTutor Is" },
  { id: "eligibility", title: "2. Eligibility" },
  { id: "tutor-verification", title: "3. Tutor Verification" },
  { id: "bookings-payments", title: "4. Bookings & Payments" },
  { id: "subscriptions", title: "5. Tutor Subscription Plans" },
  { id: "conduct", title: "6. Code of Conduct" },
  { id: "reviews", title: "7. Reviews" },
  { id: "safety", title: "8. Safety for In-Home Sessions" },
  { id: "ip", title: "9. Intellectual Property" },
  { id: "liability", title: "10. Limitation of Liability" },
  { id: "disputes", title: "11. Dispute Resolution" },
  { id: "changes", title: "12. Changes to These Terms" },
  { id: "contact", title: "13. Contact" },
];

export const metadata = {
  title: "Terms of Service | HomeTutor (TutorNest)",
  description: "The terms governing use of the HomeTutor tutoring marketplace.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated={LAST_UPDATED} sections={sections}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of the HomeTutor (TutorNest) website
        and app (the &quot;Platform&quot;), operated by{" "}
        <strong>HomeTutor EdTech Private Limited</strong> (&quot;HomeTutor&quot;, &quot;we&quot;,
        &quot;us&quot;), registered in Maharashtra, India, with its registered address at 123 Education Hub, Mumbai, MH 400001.
      </p>
      <p>
        By creating an account or using the Platform, you agree to these Terms. If you
        don&apos;t agree, don&apos;t use the Platform.
      </p>

      <h2 id="what-hometutor-is">1. What HomeTutor Is</h2>
      <p>
        HomeTutor is a marketplace that connects Students (or their parents/guardians)
        with independent Tutors for home and online tuition.{" "}
        <strong>HomeTutor is not a tutoring service itself</strong> — we do not employ
        tutors, and we do not control the content, quality, or conduct of any lesson.
        Tutors are independent, self-employed individuals who set their own rates,
        availability, and teaching methods.
      </p>

      <h2 id="eligibility">2. Eligibility</h2>
      <ul>
        <li>You must be at least 18 years old to create an account. Minors may use the Platform only through a parent or guardian&apos;s account.</li>
        <li>Tutors must provide accurate information during registration, including identity and qualification documents, for verification purposes.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
      </ul>

      <h2 id="tutor-verification">3. Tutor Verification</h2>
      <p>
        We require tutors to submit a government-issued ID and relevant qualification
        documents before their profile is marked verified. Verification confirms document
        authenticity to a reasonable standard —{" "}
        <strong>it is not a background check, criminal record check, or guarantee of
        teaching quality.</strong> Parents and students are encouraged to conduct their own
        due diligence (e.g., a trial session, checking reviews) before committing to
        ongoing lessons, especially for in-home sessions.
      </p>

      <h2 id="bookings-payments">4. Bookings and Payments</h2>
      <ul>
        <li>Students book and pay for lessons through the Platform using our payment partner, Razorpay.</li>
        <li>
          Payment is processed at the time of booking (or per your selected plan/subscription)
          and held per our{" "}
          <a href="/refund-policy">Refund &amp; Cancellation Policy</a>.
        </li>
        <li>Tutors are paid out according to the payout schedule described in their dashboard, less any applicable platform fee.</li>
        <li>
          We are not responsible for payments made outside the Platform. Any lesson
          arranged and paid for outside HomeTutor is not covered by our booking
          protections, dispute resolution, or refund policy.
        </li>
      </ul>

      <h2 id="subscriptions">5. Tutor Subscription Plans</h2>
      <p>
        Tutors may access certain features (e.g., higher visibility, additional coin packages, student requirement leads)
        through paid subscription plans. Subscription fees are non-refundable except as
        required by law or explicitly stated in our Refund Policy. Subscriptions renew
        automatically unless cancelled before the renewal date.
      </p>

      <h2 id="conduct">6. Code of Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Provide false information about your identity, qualifications, or intentions</li>
        <li>Harass, threaten, or discriminate against any other user</li>
        <li>Attempt to circumvent the Platform to avoid fees (e.g., soliciting a Student/Tutor found via HomeTutor to transact off-platform)</li>
        <li>Use the Platform for any unlawful purpose</li>
      </ul>
      <p>We may suspend or terminate accounts that violate this Code of Conduct, at our discretion.</p>

      <h2 id="reviews">7. Reviews</h2>
      <p>
        Reviews may only be submitted by a Student following a completed, verified
        booking or interaction. Reviews must reflect genuine experiences. We reserve the right to
        remove reviews that are abusive, fraudulent, or violate applicable law.
      </p>

      <h2 id="safety">8. Safety for In-Home Sessions</h2>
      <p>
        Home tutoring involves a tutor visiting a student&apos;s residence, or vice versa.{" "}
        <strong>HomeTutor strongly recommends:</strong>
      </p>
      <ul>
        <li>Being present or having another adult present during initial sessions with a new tutor, especially for minors</li>
        <li>Meeting in a common area of the home</li>
        <li>Verifying the tutor&apos;s identity in person before the first session</li>
      </ul>
      <p>
        HomeTutor is a facilitator of introductions and bookings. We are not present
        during sessions and cannot guarantee the safety of any in-person interaction.
        See Section 10 (Limitation of Liability).
      </p>

      <h2 id="ip">9. Intellectual Property</h2>
      <p>
        The Platform, its design, logo, and content (excluding user-submitted content
        like tutor profiles and reviews) are owned by HomeTutor. You may not copy,
        reproduce, or use our branding without written permission.
      </p>

      <h2 id="liability">10. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, HomeTutor is not liable for:</p>
      <ul>
        <li>The conduct, actions, or omissions of any Tutor or Student, on or off the Platform</li>
        <li>The quality, accuracy, or outcome of any tutoring session</li>
        <li>Any loss, injury, or damage arising from an in-person or online session arranged through the Platform</li>
        <li>Indirect, incidental, or consequential damages of any kind</li>
      </ul>
      <p>
        Our total liability for any claim arising from your use of the Platform is
        limited to the amount you paid us in the 3 months preceding the claim.
      </p>

      <h2 id="disputes">11. Dispute Resolution</h2>
      <p>
        Disputes between Students and Tutors regarding lesson quality, scheduling, or
        conduct should first be raised through our support team. Disputes regarding
        payments follow our Refund &amp; Cancellation Policy. Any legal dispute with
        HomeTutor itself is subject to the exclusive jurisdiction of the courts of
        Mumbai, Maharashtra, India, and governed by Indian law.
      </p>

      <h2 id="changes">12. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Platform
        after changes take effect constitutes acceptance of the revised Terms.
        Material changes will be notified via email or in-app notice.
      </p>

      <h2 id="contact">13. Contact</h2>
      <p>Questions about these Terms can be addressed to: <strong>support@tutornest.com</strong></p>
    </LegalPageLayout>
  );
}
