import LegalPageLayout from "../components/LegalPageLayout";

export default function TermsOfService() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description="Terms governing use of the Stanford Development Solutions website."
    >
      <section>
        <h2>Who operates this site</h2>
        <p>
          This website and the services described on it are operated
          independently by Kade Stanford under the Stanford Development
          Solutions name.
        </p>
      </section>

      <section>
        <h2>Using this website</h2>
        <p>
          By using this website, you agree to these terms. You may use the site
          only for lawful purposes and may not interfere with its operation,
          attempt unauthorized access, submit malicious content, or misuse any
          account or communication feature.
        </p>
      </section>

      <section>
        <h2>Services and proposals</h2>
        <p>
          Website content, consultations, audits, estimates, and proposals are
          informational and do not create a client relationship by themselves.
          A signed proposal, statement of work, or other written client
          agreement controls the scope, price, timing, ownership, and support
          terms for paid services. If that agreement conflicts with these terms,
          the client agreement controls.
        </p>
        <p>
          Published prices are starting points, not binding quotes. Advertising
          spend and third-party costs are separate unless a written proposal
          expressly includes them.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          If you receive access to a client account, you are responsible for
          keeping credentials confidential and for activity under your account.
          Notify us promptly if you suspect unauthorized access. We may suspend
          access to protect the site, users, or client information.
        </p>
      </section>

      <section>
        <h2>Content and intellectual property</h2>
        <p>
          The site design, text, graphics, and software are owned by Stanford
          Development Solutions or used with permission. You may not copy,
          republish, or commercially exploit them without written permission.
          You retain ownership of content you submit and authorize us to use it
          as needed to respond to you and provide requested services.
        </p>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          The site may link to or rely on third-party services. We do not control
          those services and are not responsible for their availability,
          content, or practices. Your use of them may be subject to separate
          terms.
        </p>
      </section>

      <section>
        <h2>Disclaimers and liability</h2>
        <p>
          The public website is provided on an “as available” basis. We do not
          promise uninterrupted access or specific business, search, advertising,
          or revenue results. To the fullest extent allowed by law, Stanford
          Development Solutions is not liable for indirect, incidental, special,
          or consequential damages arising from use of the public website.
          Rights that cannot lawfully be excluded remain unaffected.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          We may update these terms as the website or services change. Continued
          use after an update means you accept the revised terms. Questions can
          be sent to{" "}
          <a href="mailto:stanforddevcontact@gmail.com">
            stanforddevcontact@gmail.com
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
