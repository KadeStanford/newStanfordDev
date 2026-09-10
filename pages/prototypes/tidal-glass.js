import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PrototypeContactForm from "../../components/prototypes/PrototypeContactForm";
import styles from "../../styles/prototypes/TidalGlass.module.css";

const TidalScene = dynamic(
  () => import("../../components/prototypes/TidalScene"),
  { ssr: false }
);

const services = [
  {
    label: "Websites",
    copy: "A clear place for customers to find you, understand the work, and take the next step.",
  },
  {
    label: "Business tools",
    copy: "Practical portals and workflows that reduce paperwork behind the scenes.",
  },
  {
    label: "Advertising",
    copy: "Google and Meta campaigns with the scope and management fee agreed in advance.",
  },
];

export default function TidalGlassPrototype() {
  const [activeService, setActiveService] = useState(0);
  const [portalVisible, setPortalVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <div className={styles.page}>
      <Head>
        <title>Tidal Glass Prototype | Stanford Development Solutions</title>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>

      <header className={styles.nav}>
        <a className={styles.wordmark} href="#top" aria-label="Stanford Development Solutions home">
          <span>S</span> Stanford Development Solutions
        </a>
        <nav aria-label="Prototype navigation">
          <a href="#work">Work</a>
          <a href="#contact">Get in touch</a>
        </nav>
        <div className={styles.switcher} aria-label="Prototype directions">
          <span aria-current="page">01</span>
          <Link href="/prototypes/alpine-editorial">02</Link>
          <Link href="/prototypes/living-field-guide">03</Link>
        </div>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="tidal-heading">
          <div className={styles.heroGlow} />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Websites and practical digital tools for small businesses</p>
            <motion.h1 initial={false} animate={{opacity:1}} id="tidal-heading">A better website<br />should make running<br />your business <em>easier.</em></motion.h1>
            <p className={styles.lede}>
              I design and build websites for contractors, restaurants, and other small businesses. That can mean a clear place for customers to find you, a stronger way to bring in inquiries, or a custom tool that cuts down on paperwork behind the scenes.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryAction} href="#contact">Get in touch</a>
              <a className={styles.secondaryAction} href="#work">See my work</a>
            </div>
            <p className={styles.availability}>
              Based near Hammond, Louisiana · Local and remote projects · Replies within 24 hours on weekdays
            </p>
          </div>

          <div className={styles.scene} aria-hidden="true">
            <TidalScene activeIndex={activeService} paused={paused || reducedMotion} />
          </div>
          <div className={styles.sceneControls}><span>Move to disturb the surface</span><button type="button" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused ? "Resume motion" : "Pause motion"}</button></div>

          <div className={styles.serviceRail}>
            {services.map((service, index) => (
              <button
                type="button"
                key={service.label}
                className={index === activeService ? styles.serviceActive : ""}
                onMouseEnter={() => setActiveService(index)}
                onFocus={() => setActiveService(index)}
                onClick={() => setActiveService(index)}
                aria-pressed={index === activeService}
              >
                <span>0{index + 1}</span>
                {service.label}
              </button>
            ))}
          </div>
          <motion.p key={activeService} initial={false} animate={{opacity:1,y:0}} transition={{duration:reducedMotion?0:.4}} className={styles.serviceCopy} aria-live="polite">
            {services[activeService].copy}
          </motion.p>
        </section>

        <section className={styles.work} id="work" aria-labelledby="tidal-work-heading">
          <div className={styles.sectionIndex}>Selected work / 01</div>
          <div className={styles.workCopy}>
            <p className={styles.eyebrow}>Website and custom business portal</p>
            <h2 id="tidal-work-heading">Big Bass Tree Service</h2>
            <p>
              Big Bass needed more than a public website. I created a site where potential customers can learn about the company and request service, along with a private portal the owner actively uses to prepare invoices and send contracts for electronic signature.
            </p>
            <ul>
              <li>Completed in approximately one week</li>
              <li>Custom contract-signing workflow</li>
              <li>Invoice creation inside the admin portal</li>
              <li>Public lead-request path</li>
            </ul>
            <a href="https://bigbasstreeservice.com/" target="_blank" rel="noreferrer">
              Visit Big Bass Tree Service <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className={styles.lensStage}>
            <Image
              src="/images/bigbass-hero.webp"
              alt="Big Bass Tree Service website homepage"
              fill
              sizes="(max-width: 800px) 92vw, 52vw"
              className={styles.projectImage}
            />
            <div className={`${styles.portalLayer} ${portalVisible ? styles.portalOpen : ""}`}>
              <div>
                <span>Behind the website</span>
                <strong>Custom contract-signing workflow</strong>
                <strong>Invoice creation inside the admin portal</strong>
              </div>
            </div>
            <button type="button" onClick={() => setPortalVisible((current) => !current)}>
              {portalVisible ? "Show public site" : "Explore the business tools"}
            </button>
          </div>
        </section>

        <section className={styles.contact} id="contact" aria-labelledby="tidal-contact-heading">
          <div className={styles.contactIntro}>
            <p className={styles.eyebrow}>Get in touch</p>
            <h2 id="tidal-contact-heading">How can I help?</h2>
            <p>
              You do not need a finished brief or a technical plan. Tell me what you want to improve, what is not working, or what you wish were easier. I will reply within 24 hours on weekdays with a useful next step.
            </p>
            <ul>
              <li>No obligation</li>
              <li>No automated sales sequence</li>
              <li>Paid work is scoped and priced in writing first</li>
            </ul>
          </div>
          <PrototypeContactForm styles={styles} />
        </section>
      </main>
    </div>
  );
}
