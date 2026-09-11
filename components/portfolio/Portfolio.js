import ProjectStage from './ProjectStage';
import Brand from './Brand';
import PageMotion from './PageMotion';
import Education from './Education';
import PricingSelector from './PricingSelector';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Contact from '../Contact';
import styles from '../../styles/Portfolio.module.css';
import { siteUrl } from '../../next-seo.config';

function Blocks({items}){return items.map((block,i)=>block.kind==='li'?<p className={styles.fact} key={i}>{block.text}</p>:<p key={i}>{block.text}</p>);}
export default function Portfolio({copy}){
 const [menuOpen,setMenuOpen]=useState(false);
 const [motionMode,setMotionMode]=useState('system');
 const [systemReduced,setSystemReduced]=useState(true);
 useEffect(()=>{
  if(performance.getEntriesByType('navigation')[0]?.type!=='reload')return;
  const previous=history.scrollRestoration;
  history.scrollRestoration='manual';
  if(location.hash)history.replaceState(history.state,'',`${location.pathname}${location.search}#top`);
  let frame;
  const showHeader=()=>{window.scrollTo({top:0,left:0,behavior:'instant'});cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));};
  showHeader();
  window.addEventListener('load',showHeader);
  const onPageShow=event=>{if(!event.persisted)showHeader();};
  window.addEventListener('pageshow',onPageShow);
  return()=>{cancelAnimationFrame(frame);history.scrollRestoration=previous;window.removeEventListener('load',showHeader);window.removeEventListener('pageshow',onPageShow);};
 },[]);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setSystemReduced(media.matches);update();media.addEventListener('change',update);try{const saved=localStorage.getItem('sds-motion');if(['system','full','reduced'].includes(saved))setMotionMode(saved);}catch{}return()=>media.removeEventListener('change',update);},[]);
 const motionEnabled=motionMode==='full'||(motionMode==='system'&&!systemReduced);
 function changeMotion(mode){setMotionMode(mode);try{localStorage.setItem('sds-motion',mode);}catch{}}

 return <div id="top" className={styles.page} data-portfolio data-motion={motionEnabled}>
  <PageMotion/>
  <Head><title>{copy['Page metadata'].blocks[0].text}</title><meta name="description" content={copy['Page metadata'].blocks[1].text}/><link rel="canonical" href={siteUrl}/><meta property="og:url" content={siteUrl}/></Head>
  <a className={styles.skip} href="#work">Skip to work</a>
  <header className={styles.nav} onKeyDown={event=>{if(event.key==='Escape'){setMenuOpen(false);event.currentTarget.querySelector('button')?.focus();}}}><Brand/><button className={styles.menuToggle} aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={()=>setMenuOpen(!menuOpen)}><span aria-hidden="true"/></button><nav id="main-navigation" data-open={menuOpen} aria-label="Main navigation" onClick={event=>{if(event.target.closest('a'))setMenuOpen(false);}}><a href="#work">Work</a><a href="#pricing">Services &amp; Pricing</a><a href="#about">About</a><a href="#contact">Get in touch ↗</a></nav></header>
  <main>
   <ProjectStage copy={copy} motionEnabled={motionEnabled} motionMode={motionMode} onMotionChange={changeMotion}/>
   <PricingSelector copy={copy}/>
   <section className={styles.about} id="about"><div className={styles.portrait}><Image src="/images/kadeCutout.png" alt="Kade Stanford" width={800} height={1000} sizes="(max-width:800px) 75vw, 35vw" style={{width:'100%',height:'100%',objectFit:'contain'}}/></div><div><h2>About <em>me...</em></h2><Blocks items={copy.About.blocks.slice(1)}/><section className={styles.process} aria-labelledby="process-title"><h3 id="process-title">{copy.Process.blocks[0].text}</h3><ol>{copy.Process.entries.map(entry=><li key={entry.title}><h4>{entry.title}</h4><Blocks items={entry.blocks}/></li>)}</ol></section><Education/></div></section>
   <div className={styles.contactWrap}><Contact portfolio/></div>
  </main>
  <footer className={styles.footer}><Brand/><p>{copy.Footer.blocks[1].text}</p><div><a href="https://github.com/KadeStanford" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/kadestanford" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="mailto:stanforddevcontact@gmail.com">Email ↗</a><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms</Link></div></footer>
 </div>;
}
