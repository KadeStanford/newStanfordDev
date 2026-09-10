import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import PrototypeContactForm from "../../components/prototypes/PrototypeContactForm";
import styles from "../../styles/prototypes/AlpineEditorial.module.css";

export default function AlpineEditorialPrototype() {
  return (
    <div className={styles.page}>
      <Head>
        <title>Alpine Editorial Prototype | Stanford Development Solutions</title>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>

      <header className={styles.nav}>
        <a className={styles.mark} href="#top" aria-label="Stanford Development Solutions home">
          SDS
        </a>
        <p>Independent web design · Hammond, Louisiana</p>
        <nav aria-label="Prototype navigation">
          <a href="#work">Work</a>
          <a href="#contact">Get in touch</a>
        </nav>
        <div className={styles.switcher} aria-label="Prototype directions">
          <Link href="/prototypes/tidal-glass">01</Link>
          <span aria-current="page">02</span>
          <Link href="/prototypes/living-field-guide">03</Link>
        </div>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="alpine-heading">
          <div className={styles.sky} aria-hidden="true">
            <span className={styles.coralDisc} />
            <span className={styles.planeBack} />
            <span className={styles.planeFront} />
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Websites and practical digital tools for small businesses</p>
            <h1 id="alpine-heading">
              A better website should make running your business <em>easier.</em>
            </h1>
            <div className={styles.introGrid}>
              <p>
                I design and build websites for contractors, restaurants, and other small businesses. That can mean a clear place for customers to find you, a stronger way to bring in inquiries, or a custom tool that cuts down on paperwork behind the scenes.
              </p>
              <div>
                <a href="#contact">Get in touch <span aria-hidden="true">↘</span></a>
                <a href="#work">See my work</a>
              </div>
            </div>
          </div>
          <p className={styles.availability}>
            Local and remote projects<br />Replies within 24 hours on weekdays
          </p>
        </section>

        <section className={styles.work} id="work" aria-labelledby="alpine-work-heading">
          <header className={styles.workHeader}>
            <p>Selected work · 01</p>
            <h2 id="alpine-work-heading">Big Bass<br />Tree Service</h2>
            <p>Website and custom business portal</p>
          </header>

          <figure className={styles.projectFigure}>
            <Image
              src="/images/bigbass.png"
              alt="Big Bass Tree Service website homepage"
              fill
              sizes="(max-width: 800px) 100vw, 82vw"
              className={styles.projectImage}
            />
            <figcaption>Public website · Lead-request path</figcaption>
          </figure>

          <div className={styles.story}>
            <p className={styles.storyLead}>
              Big Bass needed more than a public website.
            </p>
            <p>
              I created a site where potential customers can learn about the company and request service, along with a private portal the owner actively uses to prepare invoices and send contracts for electronic signature.
            </p>
            <dl>
              <div><dt>Timeline</dt><dd>Approximately one week</dd></div>
              <div><dt>Public side</dt><dd>Services and lead requests</dd></div>
              <div><dt>Private side</dt><dd>Contracts and invoices</dd></div>
              <div><dt>My role</dt><dd>Design through ongoing management</dd></div>
            </dl>
            <details>
              <summary>Inside the working portal</summary>
              <div className={styles.portalNote}>
                <span>01</span><p>Create and send the client's legal contracts for electronic signature.</p>
                <span>02</span><p>Prepare invoices from the same private workspace.</p>
                <span>03</span><p>The owner actively uses the portal; it was the main reason for commissioning the project.</p>
              </div>
            </details>
            <a className={styles.visit} href="https://bigbasstreeservice.com/" target="_blank" rel="noreferrer">
              Visit Big Bass Tree Service ↗
            </a>
          </div>
        </section>

        <section className={styles.contact} id="contact" aria-labelledby="alpine-contact-heading">
          <header className={styles.contactHeader}>
            <p className={styles.kicker}>Get in touch</p>
            <h2 id="alpine-contact-heading">How can<br />I help?</h2>
            <p>
              You do not need a finished brief or a technical plan. Tell me what you want to improve, what is not working, or what you wish were easier. I will reply within 24 hours on weekdays with a useful next step.
            </p>
            <ul>
              <li>No obligation</li>
              <li>No automated sales sequence</li>
              <li>Paid work is scoped and priced in writing first</li>
            </ul>
          </header>
          <PrototypeContactForm styles={styles} />
        </section>
      </main>
    </div>
  );
}
