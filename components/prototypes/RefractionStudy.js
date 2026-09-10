import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/prototypes/RefractionStudy.module.css';

export default function RefractionStudy({ variant }) {
 const mineral = variant === 'b';
 return <div className={`${styles.page} ${mineral ? styles.mineral : styles.optical}`}>
  <Head><title>{mineral ? 'Mineral Folio' : 'Optical Cover'} — Static study</title><meta name="robots" content="noindex,nofollow,noarchive" /></Head>
  <a className={styles.skip} href="#work">Skip to work</a>
  <header className={styles.header}><a href="#top" className={styles.name}>Stanford<br/>Development Solutions</a><nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="/contact">Contact</a></nav></header>
  <main id="top">
   <section className={styles.cover} aria-labelledby="cover-title">
    <div className={styles.title}><h1 id="cover-title">Web design<br/><span>&amp; development.</span></h1></div>
    <div className={styles.intro} id="about"><p>I’m Kade. I design and build websites.</p><a href="#work">See my work <span aria-hidden="true">↘</span></a></div>
    <div className={styles.art}><Image src="/art/refraction/folds.jpg" alt="" fill priority sizes="(max-width: 700px) 100vw, 55vw" style={{objectFit:'cover'}} /></div>
    <p className={styles.caption}>Cover art · supplied visual reference</p>
   </section>
   <section className={styles.work} id="work" aria-labelledby="work-title">
    <div className={styles.workHeading}><h2 id="work-title">Selected work</h2><span>01</span></div>
    <div className={styles.project}>
     <figure><Image src="/images/bigbass-hero.webp" width={1600} height={900} sizes="(max-width:700px) 90vw, 65vw" style={{width:'100%',height:'auto'}} alt="Big Bass Tree Service public website homepage" /></figure>
     <div className={styles.projectCopy}><h3>Big Bass<br/>Tree Service</h3><p className={styles.role}>Website and custom business portal</p><h4>What they needed</h4><p>A public website for service inquiries and a private portal for contracts and invoices.</p><h4>What I did</h4><p>Design, development, copy, search setup, tracking, hosting, and ongoing management.</p><p>I built contract signing and invoice creation into the owner’s portal.</p><a href="https://bigbasstreeservice.com/" target="_blank" rel="noreferrer">Visit Big Bass Tree Service ↗</a></div>
    </div>
   </section>
  </main>
  <footer className={styles.review}><span>Private static study {mineral?'B · Mineral Folio':'A · Optical Cover'} · Draft copy</span><a href={mineral?'/prototypes/optical-cover':'/prototypes/mineral-folio'}>View study {mineral?'A':'B'} →</a></footer>
 </div>;
}
