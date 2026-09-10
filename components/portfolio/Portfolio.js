import ProjectStage from './ProjectStage';
import { useState } from 'react';
import WorkflowLab from './BusinessLab';
import Head from 'next/head';
import Image from 'next/image';
import Contact from '../Contact';
import styles from '../../styles/Portfolio.module.css';
import { siteUrl } from '../../next-seo.config';

function Blocks({items}){return items.map((block,i)=>block.kind==='li'?<p className={styles.fact} key={i}>{block.text}</p>:<p key={i}>{block.text}</p>);}
export default function Portfolio({copy}){
 const [menuOpen,setMenuOpen]=useState(false);

 return <div className={styles.page}>
  <Head><title>{copy['Page metadata'].blocks[0].text}</title><meta name="description" content={copy['Page metadata'].blocks[1].text}/><link rel="canonical" href={siteUrl}/><meta property="og:url" content={siteUrl}/></Head>
  <a className={styles.skip} href="#work">Skip to work</a>
  <header className={styles.nav} onKeyDown={event=>{if(event.key==='Escape'){setMenuOpen(false);event.currentTarget.querySelector('button')?.focus();}}}><a className={styles.brand} href="#top" aria-label="SDS — Stanford Development Solutions"><span className={styles.monogram} aria-hidden="true">SDS<i/></span></a><button className={styles.menuToggle} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?'Close':'Menu'}<span aria-hidden="true">{menuOpen?'−':'+'}</span></button><nav id="main-navigation" data-open={menuOpen} aria-label="Main navigation" onClick={event=>{if(event.target.closest('a'))setMenuOpen(false);}}><a href="#work">Work</a><a href="#pricing">Services &amp; Pricing</a><a href="#about">About</a><a href="#contact">Get in touch ↗</a></nav></header>
  <main>
   <ProjectStage copy={copy}/>
   <section className={styles.introduction}><p>{copy.Opening.blocks[2].text}</p><span>{copy.Opening.blocks[5].text}</span></section>
   <WorkflowLab/>
   <section className={styles.services} id="pricing"><div className={styles.sectionHeader}><span>02 / Services &amp; Pricing</span><h2>{copy.Services.blocks[0].text}</h2></div><p className={styles.sectionIntro}>{copy.Services.blocks[1].text}</p><div className={styles.serviceList}>{copy.Services.entries.map((service,i)=><details key={service.title}><summary><span>0{i+1}</span>{service.title}<b>+</b></summary><div><Blocks items={service.blocks}/></div></details>)}</div>
    <div className={styles.priceIntro}><h3>{copy.Pricing.blocks[0].text}</h3><p>{copy.Pricing.blocks[1].text}</p></div><div className={styles.prices}>{copy.Pricing.entries.map((price)=><details key={price.title}><summary>{price.title}<b>+</b></summary><Blocks items={price.blocks}/></details>)}</div><p className={styles.pricingNote}>{copy.Pricing.note}</p>
   </section>
   <section className={styles.about} id="about"><div className={styles.portrait}><Image src="/images/kadeProfile.jpg" alt="Kade Stanford" width={800} height={1000} sizes="(max-width:800px) 75vw, 35vw" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div><div><span>03 / About</span><h2>{copy.About.blocks[0].text}</h2><Blocks items={copy.About.blocks.slice(1)}/><details className={styles.process}><summary>Working together <b>+</b></summary>{copy.Process.entries.map(entry=><div key={entry.title}><h3>{entry.title}</h3><Blocks items={entry.blocks}/></div>)}</details></div></section>
   <div className={styles.contactWrap}><Contact portfolio/></div>
  </main>
  <footer className={styles.footer}><a href="#top">Stanford Development Solutions ↑</a><p>{copy.Footer.blocks[1].text}</p><div><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a><a href="mailto:stanforddevcontact@gmail.com">Email ↗</a></div></footer>
 </div>;
}
