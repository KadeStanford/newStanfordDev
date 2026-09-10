import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
import Contact from '../Contact';
import styles from '../../styles/Portfolio.module.css';
import { siteUrl } from '../../next-seo.config';

const Glass=dynamic(()=>import('./GlassExperience'),{ssr:false});
function Blocks({items}){return items.map((block,i)=>block.kind==='li'?<p className={styles.fact} key={i}>{block.text}</p>:<p key={i}>{block.text}</p>);}
export default function Portfolio({copy}){
 const [effects,setEffects]=useState(false);const [failed,setFailed]=useState(false);
 const [mode,setMode]=useState(0);const [turn,setTurn]=useState(0);
 useEffect(()=>{setEffects(!window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches);},[]);
 const projects=copy['Selected work'].entries;
 return <div className={styles.page}>
  <Head><title>{copy['Page metadata'].blocks[0].text}</title><meta name="description" content={copy['Page metadata'].blocks[1].text}/><link rel="canonical" href={siteUrl}/><meta property="og:url" content={siteUrl}/></Head>
  <a className={styles.skip} href="#work">Skip to work</a>
  <header className={styles.nav}><a className={styles.brand} href="#top">Stanford<span>Development Solutions</span></a><nav aria-label="Main navigation"><a href="#work" onClick={()=>setMode(1)}>Work</a><a href="#pricing" onClick={()=>setMode(2)}>Services &amp; Pricing</a><a href="#about">About</a><a href="#contact" onClick={()=>setMode(1)}>Get in touch ↗</a></nav></header>
  <main>
   <section className={styles.hero} id="top" aria-labelledby="opening">
    <div className={styles.heroMeta}><span>Independent web design &amp; development</span><span>Hammond, Louisiana</span></div>
    <div className={styles.art} aria-hidden="true">{effects&&!failed?<Glass mode={mode} paused={!effects} turn={turn} onFailure={()=>{setFailed(true);setEffects(false);}}/>:<div className={styles.still}><span>Websites.</span><span>Business tools.</span><span>Advertising.</span></div>}</div>
    <div className={styles.heroTitle}><p>{copy.Opening.blocks[0].text}</p><h1 id="opening">A better website<br/>should make running<br/>your business <em>easier.</em></h1></div>
    <div className={styles.artTools}><span>{failed?'Static view':effects?'Drag the glass to explore':'Static view · Enable 3D to explore'}</span><div><button onClick={()=>setEffects(v=>!v)} disabled={failed}>{effects?'Effects off':'Enable 3D'}</button>{effects&&<><button aria-label="Rotate glass left" onClick={()=>setTurn(v=>v-.6)}>←</button><button aria-label="Rotate glass right" onClick={()=>setTurn(v=>v+.6)}>→</button></>}</div></div>
    <div className={styles.shapeControls} aria-label="Glass composition">{['Fold','Unfold','Fan'].map((label,i)=><button key={label} aria-pressed={mode===i} onClick={()=>{setMode(i);if(!failed)setEffects(true);}}><span>0{i+1}</span>{label}</button>)}</div>
    <a className={styles.workLink} href="#work" onClick={()=>setMode(1)}>See my work <span>↓</span></a>
   </section>
   <section className={styles.introduction}><p>{copy.Opening.blocks[2].text}</p><span>{copy.Opening.blocks[5].text}</span></section>
   <section className={styles.work} id="work"><div className={styles.sectionHeader}><span>01 / Work</span><h2>{copy['Selected work'].blocks[0].text}</h2></div><p className={styles.sectionIntro}>{copy['Selected work'].blocks[1].text}</p>
    {projects.map((project,i)=><article className={styles.project} key={project.title}><div className={styles.projectHeading}><span>0{i+1}</span><h3>{project.title}</h3><a target="_blank" rel="noreferrer" href={i===0?'https://bigbasstreeservice.com/':'https://libertyhousespecialties.com/'}>Visit website ↗</a></div><a className={styles.projectImage} href={i===0?'https://bigbasstreeservice.com/':'https://libertyhousespecialties.com/'} target="_blank" rel="noreferrer"><Image src={i===0?'/images/bigbass-hero.webp':'/images/libertyhouse-hero.webp'} width={1600} height={900} sizes="(max-width:800px) 92vw, 85vw" alt={`${project.title} website homepage`} style={{width:'100%',height:'auto'}}/></a><div className={styles.projectDetails}><p>{project.blocks[1].text}</p><details><summary>What I built <span>+</span></summary><Blocks items={project.blocks.slice(2).filter(b=>!b.text.startsWith('Visit '))}/></details></div></article>)}
   </section>
   <section className={styles.services} id="pricing"><div className={styles.sectionHeader}><span>02 / Services &amp; Pricing</span><h2>{copy.Services.blocks[0].text}</h2></div><p className={styles.sectionIntro}>{copy.Services.blocks[1].text}</p><div className={styles.serviceList}>{copy.Services.entries.map((service,i)=><details key={service.title}><summary><span>0{i+1}</span>{service.title}<b>+</b></summary><div><Blocks items={service.blocks}/></div></details>)}</div>
    <div className={styles.priceIntro}><h3>{copy.Pricing.blocks[0].text}</h3><p>{copy.Pricing.blocks[1].text}</p></div><div className={styles.prices}>{copy.Pricing.entries.map((price)=><details key={price.title}><summary>{price.title}<b>+</b></summary><Blocks items={price.blocks}/></details>)}</div><p className={styles.pricingNote}>{copy.Pricing.note}</p>
   </section>
   <section className={styles.about} id="about"><div className={styles.portrait}><Image src="/images/kadeProfile.jpg" alt="Kade Stanford" width={800} height={1000} sizes="(max-width:800px) 75vw, 35vw" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div><div><span>03 / About</span><h2>{copy.About.blocks[0].text}</h2><Blocks items={copy.About.blocks.slice(1)}/><details className={styles.process}><summary>Working together <b>+</b></summary>{copy.Process.entries.map(entry=><div key={entry.title}><h3>{entry.title}</h3><Blocks items={entry.blocks}/></div>)}</details></div></section>
   <div className={styles.contactWrap}><Contact portfolio/></div>
  </main>
  <footer className={styles.footer}><a href="#top">Stanford Development Solutions ↑</a><p>{copy.Footer.blocks[1].text}</p><div><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a><a href="mailto:stanforddevcontact@gmail.com">Email ↗</a></div></footer>
 </div>;
}
