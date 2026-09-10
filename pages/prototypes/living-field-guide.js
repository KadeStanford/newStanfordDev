import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import PrototypeContactForm from "../../components/prototypes/PrototypeContactForm";
import styles from "../../styles/prototypes/LivingFieldGuide.module.css";

const bands = [
  {
    number: "01",
    title: "Websites",
    copy: "New websites and redesigns that explain what you offer, work well on phones, and give customers a clear next step.",
  },
  {
    number: "02",
    title: "Business tools",
    copy: "Practical tools built around a specific workflow—from contracts and invoices to portals and lead organization.",
  },
  {
    number: "03",
    title: "Advertising",
    copy: "Paid campaigns on Google, Facebook, and Instagram with the scope, management fee, and tracking plan agreed first.",
  },
];

export default function LivingFieldGuidePrototype() {
  const [activeBand, setActiveBand] = useState(0);
  const [reveal, setReveal] = useState(54);

  return (
    <div className={styles.page}>
      <Head>
        <title>Living Field Guide Prototype | Stanford Development Solutions</title>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>

      <header className={styles.nav}>
        <a className={styles.wordmark} href="#top">
          Stanford <span>Development Solutions</span>
        </a>
        <nav aria-label="Prototype navigation">
          <a href="#work">Work</a>
          <a href="#contact">Get in touch</a>
        </nav>
        <div className={styles.switcher} aria-label="Prototype directions">
          <Link href="/prototypes/tidal-glass">01</Link>
          <Link href="/prototypes/alpine-editorial">02</Link>
          <span aria-current="page">03</span>
        </div>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="field-heading">
          <div className={styles.copyBlock}>
            <p className={styles.eyebrow}>Websites and practical digital tools for small businesses</p>
            <h1 id="field-heading">A better website should make running your business easier.</h1>
            <p className={styles.lede}>
              I design and build websites for contractors, restaurants, and other small businesses. That can mean a clear place for customers to find you, a stronger way to bring in inquiries, or a custom tool that cuts down on paperwork behind the scenes.
            </p>
            <div className={styles.actions}>
              <a href="#contact">Get in touch</a>
              <a href="#work">See my work</a>
            </div>
            <p className={styles.availability}>
              Based near Hammond, Louisiana · Available for local and remote projects · I reply within 24 hours on weekdays
            </p>
          </div>

          <div className={styles.bandField} aria-label="Explore services">
            {bands.map((band, index) => (
              <button
                key={band.title}
                type="button"
                className={`${styles.band} ${styles[`band${index + 1}`]} ${activeBand === index ? styles.bandActive : ""}`}
                onClick={() => setActiveBand(index)}
                aria-expanded={activeBand === index}
              >
                <span>{band.number}</span>
                <strong>{band.title}</strong>
                <p>{band.copy}</p>
              </button>
            ))}
          </div>
          <p className={styles.exploreHint}>Choose a band to explore</p>
        </section>

        <section className={styles.work} id="work" aria-labelledby="field-work-heading">
          <div className={styles.specimenLabel}>
            <span>Specimen 01</span>
            <span>Website + working portal</span>
          </div>
          <header className={styles.workHeader}>
            <p className={styles.eyebrow}>Selected work</p>
            <h2 id="field-work-heading">Big Bass Tree Service</h2>
            <p>
              Big Bass needed more than a public website. I created a site where potential customers can learn about the company and request service, along with a private portal the owner actively uses to prepare invoices and send contracts for electronic signature.
            </p>
          </header>

          <div className={styles.comparison} style={{ "--reveal": `${reveal}%` }}>
            <div className={styles.publicLayer}>
              <Image
                src="/images/bigbass-hero.webp"
                alt="Big Bass Tree Service public website"
                fill
                sizes="(max-width: 800px) 100vw, 70vw"
                className={styles.projectImage}
              />
              <span>Public website</span>
            </div>
            <div className={styles.portalLayer} aria-hidden="true">
              <div className={styles.portalWindow}>
                <header><span>Big Bass workspace</span><i /><i /><i /></header>
                <div className={styles.portalBody}>
                  <aside>Overview<br />Contracts<br />Invoices<br />Clients</aside>
                  <div>
                    <p>Working portal</p>
                    <strong>Contracts ready to send</strong>
                    <strong>Invoices in one place</strong>
                    <strong>Client records organized</strong>
                  </div>
                </div>
              </div>
              <span>Private business portal</span>
            </div>
            <label className={styles.revealControl}>
              <span className={styles.srOnly}>Reveal public website or private portal</span>
              <input
                type="range"
                min="18"
                max="82"
                value={reveal}
                onChange={(event) => setReveal(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.annotations}>
            <div><span>01</span><p>Completed in approximately one week</p></div>
            <div><span>02</span><p>Custom contract-signing workflow</p></div>
            <div><span>03</span><p>Invoice creation inside the admin portal</p></div>
            <div><span>04</span><p>Public lead-request path</p></div>
          </div>
          <a className={styles.visit} href="https://bigbasstreeservice.com/" target="_blank" rel="noreferrer">
            Visit Big Bass Tree Service ↗
          </a>
        </section>

        <section className={styles.contact} id="contact" aria-labelledby="field-contact-heading">
          <div className={styles.contactBands} aria-hidden="true"><i /><i /><i /></div>
          <header className={styles.contactHeader}>
            <p className={styles.eyebrow}>Get in touch</p>
            <h2 id="field-contact-heading">How can I help?</h2>
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
