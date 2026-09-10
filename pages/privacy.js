import LegalPageLayout from "../components/LegalPageLayout";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="How Stanford Development Solutions collects, uses, and protects information."
    >
      <section>
        <h2>Who operates this site</h2>
        <p>
          This website is operated independently by Kade Stanford under the
          Stanford Development Solutions name.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <p>
          We collect information you choose to provide through contact, project,
          account, testimonial, and payment-related forms. This may include your
          name, email address, phone number, business details, project requests,
          and messages. Client accounts may also contain project, invoice, and
          service information.
        </p>
      </section>

      <section>
        <h2>Website and analytics data</h2>
        <p>
          We and our service providers may collect device, browser, referral,
          page-view, and interaction data to operate the site, prevent abuse,
          and understand performance. Network addresses may be processed
          temporarily for security and rate limiting; our internal live counter
          stores a one-way identifier rather than a raw network address.
        </p>
      </section>

      <section>
        <h2>How we use information</h2>
        <ul>
          <li>Respond to inquiries and provide requested services.</li>
          <li>Operate client accounts, projects, invoices, and communications.</li>
          <li>Secure, troubleshoot, measure, and improve the website.</li>
          <li>Comply with legal obligations and enforce our agreements.</li>
        </ul>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>
          We use providers that support hosting, authentication, databases,
          email delivery, spam prevention, and analytics. These may include AWS,
          Google Firebase, Google Analytics, Google reCAPTCHA, PostHog, and
          Mailgun. Their handling of information is governed by their own
          terms and privacy notices. We do not sell personal information.
        </p>
      </section>

      <section>
        <h2>Retention and security</h2>
        <p>
          We retain information for as long as reasonably needed to provide
          services, maintain business and security records, resolve disputes,
          and meet legal obligations. We use reasonable safeguards, but no
          internet transmission or storage system can be guaranteed completely
          secure.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You may ask to access, correct, or delete personal information we hold
          about you, subject to applicable law and legitimate recordkeeping
          needs. Browser settings and privacy tools may also limit cookies or
          analytics, although some site functions may be affected.
        </p>
      </section>

      <section>
        <h2>Children and updates</h2>
        <p>
          This website is intended for businesses and is not directed to
          children under 13. We may update this policy as our services change;
          the effective date above identifies the current version.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Privacy questions or requests can be sent to{" "}
          <a href="mailto:stanforddevcontact@gmail.com">
            stanforddevcontact@gmail.com
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
