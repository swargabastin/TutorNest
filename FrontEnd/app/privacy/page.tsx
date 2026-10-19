import LegalPageLayout from "@/components/LegalPageLayout";

const LAST_UPDATED = "August 24, 2026";

const sections = [
  { id: "info-we-collect", title: "1. Information We Collect" },
  { id: "how-we-use", title: "2. How We Use It" },
  { id: "who-we-share-with", title: "3. Who We Share Data With" },
  { id: "verification-docs", title: "4. Verification Documents" },
  { id: "childrens-data", title: "5. Children's Data" },
  { id: "cookies", title: "6. Cookies" },
  { id: "retention", title: "7. Data Retention" },
  { id: "your-rights", title: "8. Your Rights" },
  { id: "security", title: "9. Data Security" },
  { id: "international", title: "10. International Transfers" },
  { id: "changes", title: "11. Changes to This Policy" },
  { id: "contact", title: "12. Contact" },
];

export const metadata = {
  title: "Privacy Policy | HomeTutor (TutorNest)",
  description: "How HomeTutor collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED} sections={sections}>
      <p>
        <strong>HomeTutor EdTech Private Limited</strong> (&quot;HomeTutor&quot;, &quot;we&quot;,
        &quot;us&quot;) operates the HomeTutor (TutorNest) website and app (the &quot;Platform&quot;).
        This Privacy Policy explains what personal data we collect, why, and how we
        protect it in accordance with applicable Indian laws including the Digital Personal Data Protection Act (DPDPA).
      </p>

      <h2 id="info-we-collect">1. Information We Collect</h2>
      <h3>Account information</h3>
      <ul>
        <li>Name, email address, phone number, city/location</li>
        <li>Password (stored as a salted hash — we never store plaintext passwords)</li>
      </ul>
      <h3>Student-specific</h3>
      <ul>
        <li>Grade/class level, subjects of interest, home address (only shared with a tutor once a booking is confirmed)</li>
        <li>If under 18: information provided by a parent/guardian on the minor&apos;s behalf</li>
      </ul>
      <h3>Tutor-specific</h3>
      <ul>
        <li>Qualifications, teaching experience, subjects taught, hourly rates</li>
        <li>Government ID and qualification documents, uploaded for verification (stored securely in our verification storage)</li>
        <li>Bank/UPI details for payouts (processed via Razorpay; we do not store full bank account numbers on our own servers)</li>
      </ul>
      <h3>Payment information</h3>
      <p>
        We do not store your credit card, debit card, UPI PIN, or banking passwords. All payment processing
        is handled by Razorpay, which is PCI-DSS compliant. We retain only transaction
        references and status (success/failure/refund) needed for accounting and booking records.
      </p>
      <h3>Usage data</h3>
      <ul>
        <li>Log data (IP address, browser type, device information)</li>
        <li>Booking history, messages/enquiries exchanged on the Platform, reviews submitted</li>
      </ul>

      <h2 id="how-we-use">2. How We Use Your Information</h2>
      <ul>
        <li>To create and manage your account</li>
        <li>To match students with tutors and facilitate requirements</li>
        <li>To verify tutor identity and qualifications before their profile is marked verified</li>
        <li>To process payments and payouts via Razorpay</li>
        <li>To send booking confirmations, coin transaction receipts, and service updates via email</li>
        <li>To respond to customer support requests</li>
        <li>To improve the Platform and detect fraud or abuse</li>
        <li>To comply with legal and regulatory obligations</li>
      </ul>
      <p>We do not sell your personal data to third parties.</p>

      <h2 id="who-we-share-with">3. Who We Share Data With</h2>
      <table>
        <thead>
          <tr>
            <th>Recipient</th>
            <th>What&apos;s shared</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Razorpay</td>
            <td>Payment amount, transaction/order reference, contact details</td>
            <td>Processing payments and refunds</td>
          </tr>
          <tr>
            <td>Storage &amp; Cloud Infrastructure</td>
            <td>Uploaded verification documents and profile photos</td>
            <td>Secure file storage and delivery</td>
          </tr>
          <tr>
            <td>Email / SMS Gateway</td>
            <td>Email address, phone number, transactional content</td>
            <td>Sending transactional alerts and password resets</td>
          </tr>
          <tr>
            <td>Other Platform users</td>
            <td>Name, profile photo, subjects, and (for confirmed bookings) contact details</td>
            <td>Enabling the tutoring connection</td>
          </tr>
          <tr>
            <td>Law enforcement / regulators</td>
            <td>As legally mandated</td>
            <td>Legal and statutory compliance</td>
          </tr>
        </tbody>
      </table>
      <p>
        A student&apos;s direct contact details are shared with a tutor{" "}
        <strong>only after a direct enquiry or connection is confirmed</strong> — not during
        public browsing.
      </p>

      <h2 id="verification-docs">4. Verification Documents</h2>
      <p>
        Tutor government ID and qualification documents are stored securely in a
        restricted-access location, viewable only by our verification administrators. These
        documents are used solely to confirm identity and qualifications and are not
        shared publicly or with students.
      </p>

      <h2 id="childrens-data">5. Children&apos;s Data</h2>
      <p>
        HomeTutor is intended for use by adults (parents/guardians) on behalf of minors
        seeking tutoring. We do not knowingly collect personal data directly from
        children under 18 without parental involvement. A student profile for a minor
        must be created and managed by a parent or guardian account.
      </p>

      <h2 id="cookies">6. Cookies</h2>
      <p>We use cookies and local storage tokens for:</p>
      <ul>
        <li>Keeping you logged in (session and authentication tokens)</li>
        <li>Remembering basic preferences and site analytics</li>
      </ul>
      <p>
        You can control cookies through your browser settings; disabling essential
        tokens will prevent you from signing in.
      </p>

      <h2 id="retention">7. Data Retention</h2>
      <ul>
        <li>Account data is retained while your account is active and for up to 3 years after closure for tax, audit, and dispute resolution purposes.</li>
        <li>Verification documents are retained as long as your tutor profile is active, and securely archived following deactivation before deletion.</li>
        <li>Financial and payment transaction records are retained per statutory Indian accounting rules (typically 7–8 years).</li>
      </ul>

      <h2 id="your-rights">8. Your Rights</h2>
      <p>You can:</p>
      <ul>
        <li>Access and update your profile information directly in your account settings</li>
        <li>Request a copy of the personal data we hold about you</li>
        <li>Request deletion of your account and associated data (subject to legal retention requirements)</li>
        <li>Withdraw consent for optional notifications at any time</li>
      </ul>
      <p>To exercise these rights, contact <strong>support@tutornest.com</strong>.</p>

      <h2 id="security">9. Data Security</h2>
      <p>
        We use HTTPS/TLS encryption for all data in transit, salted hashed passwords, and
        role-based access controls for sensitive verification records. No system is 100% secure,
        but we implement rigorous technical and organizational measures to safeguard your data.
      </p>

      <h2 id="international">10. International Data Transfers</h2>
      <p>
        Our servers and service providers (cloud hosting, database, email relays) may process
        or store data on secure servers in or outside India in compliance with standard data protection safeguards.
      </p>

      <h2 id="changes">11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Material changes will be
        notified via email or an in-app notice prior to taking effect.
      </p>

      <h2 id="contact">12. Contact &amp; Grievance Officer</h2>
      <p>Questions or requests regarding your data: <strong>support@tutornest.com</strong></p>
      <p>
        Grievance Officer (pursuant to IT Rules &amp; DPDPA):<br />
        <strong>Grievance Officer, HomeTutor EdTech Pvt. Ltd.</strong><br />
        Email: <strong>grievance@tutornest.com</strong><br />
        Address: 123 Education Hub, Mumbai, MH 400001
      </p>
    </LegalPageLayout>
  );
}
