import Link from 'next/link';
import Head from 'next/head';
import Contact from '../components/Contact';
import styles from '../styles/Portfolio.module.css';
import { siteUrl } from '../next-seo.config';
export default function ContactPage(){return <div className={styles.page}>
 <Head><title>Get in touch | Stanford Development Solutions</title><meta name="description" content="Get in touch with Kade Stanford about your website, business tools, or advertising."/><link rel="canonical" href={`${siteUrl}/contact`}/></Head>
 <header className={styles.nav}><Link className={styles.brand} href="/">Stanford<span>Development Solutions</span></Link><nav aria-label="Main navigation"><Link href="/#work">Work</Link><Link href="/#pricing">Services &amp; Pricing</Link><Link href="/#about">About</Link></nav></header>
 <main className={styles.contactWrap}><Contact/></main>
 <footer className={styles.footer}><Link href="/">Stanford Development Solutions</Link><div><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms</Link></div></footer>
</div>;}
