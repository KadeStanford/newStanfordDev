import Head from 'next/head';
import Contact from '../components/Contact';
import styles from '../styles/Portfolio.module.css';
import { siteUrl } from '../next-seo.config';
export default function ContactPage(){return <div className={styles.page}>
 <Head><title>Get in touch | Stanford Development Solutions</title><meta name="description" content="Get in touch with Kade Stanford about your website, business tools, or advertising."/><link rel="canonical" href={`${siteUrl}/contact`}/></Head>
 <header className={styles.nav}><a className={styles.brand} href="/">Stanford<span>Development Solutions</span></a><nav aria-label="Main navigation"><a href="/#work">Work</a><a href="/#pricing">Services &amp; Pricing</a><a href="/#about">About</a></nav></header>
 <main className={styles.contactWrap}><Contact/></main>
 <footer className={styles.footer}><a href="/">Stanford Development Solutions</a><div><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a></div></footer>
</div>;}
