import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import dynamic from 'next/dynamic';
import AccessibilityTray from './AccessibilityTray';
import ProjectGallery from './ProjectGallery';
import styles from '../../styles/ProjectStage.module.css';
import { orbitOptions } from './orbitFonts';

const images = ['/images/projects/bigbass-home.webp', '/images/projects/liberty-home.webp'];
const CurvedType3D=dynamic(()=>import('./CurvedType3D'),{ssr:false});
const brandImages = ['/images/projects/bigbass-logo.png', '/images/projects/liberty-brand.png'];
const urls = ['https://www.bigbasstrees.com/', 'https://libertyhousespecialties.com/'];

export default function ProjectStage({ copy, motionEnabled=true, motionMode='system', onMotionChange }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [mobile,setMobile]=useState(false);
  const [textPreset,setTextPreset]=useState('bungee-monoton');
  const [typeReady,setTypeReady]=useState(false);
  useEffect(()=>{const media=matchMedia('(max-width:800px)');const update=()=>setMobile(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{setTypeReady(false);},[mobile,motionEnabled]);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltMessage, setTiltMessage] = useState('');
  const animateSwaps=motionEnabled;
  const stage = useRef(null);
  const projects = copy['Selected work'].entries;
  const project = projects[selected];
  const focus = useRef(null);
  const swapping = useRef(false);
  const animations = useRef([]);
  useEffect(()=>()=>animations.current.forEach(animation=>animation.cancel()),[]);
  useEffect(()=>{if(!animateSwaps)animations.current.forEach(animation=>animation.finish());},[animateSwaps]);
  useEffect(()=>{
    reset();
    if(!tiltEnabled||!motionEnabled)return;
    let baseline=null;
    const timer=setTimeout(()=>{setTiltEnabled(false);setTiltMessage('No sensor data received. Touch movement is still available.');},5000);
    const orient=event=>{
      if(!Number.isFinite(event.beta)||!Number.isFinite(event.gamma))return;
      clearTimeout(timer);
      if(document.hidden||!window.matchMedia('(max-width:800px)').matches){baseline=null;return;}
      const box=stage.current.getBoundingClientRect();
      if(box.bottom<0||box.top>innerHeight){baseline=null;return;}
      const angle=window.screen.orientation?.angle??window.orientation??0;
      if(!baseline||baseline.angle!==angle){baseline={beta:event.beta,gamma:event.gamma,angle};return;}
      if(swapping.current)return;
      const radians=angle*Math.PI/180;
      const dx=event.gamma-baseline.gamma,dy=event.beta-baseline.beta;
      const clamp=value=>Math.max(-4,Math.min(4,value*.18));
      stage.current.style.setProperty('--rx',`${clamp(-dy*Math.cos(radians)+dx*Math.sin(radians))}deg`);
      stage.current.style.setProperty('--ry',`${clamp(dx*Math.cos(radians)+dy*Math.sin(radians))}deg`);
    };
    window.addEventListener('deviceorientation',orient,{passive:true});
    return()=>{clearTimeout(timer);window.removeEventListener('deviceorientation',orient);reset();};
  },[tiltEnabled,motionEnabled]);

  async function toggleTilt(){
    if(tiltEnabled){setTiltEnabled(false);setTiltMessage('');return;}
    setTiltMessage('');
    if(!window.isSecureContext||!window.DeviceOrientationEvent){setTiltMessage('Device tilt is unavailable here. Touch movement is still available.');return;}
    try{
      if(typeof window.DeviceOrientationEvent.requestPermission==='function'&&await window.DeviceOrientationEvent.requestPermission()!=='granted'){setTiltMessage('Motion permission was not granted. Touch movement is still available.');return;}
      setTiltEnabled(true);
    }catch{setTiltMessage('Device tilt could not be enabled. Touch movement is still available.');}
  }

  async function selectProject(index){
    if(index===selected||swapping.current)return;
    if(!animateSwaps){setSelected(index);return;}
    const mobile=window.matchMedia('(max-width:800px)').matches;
    const cards=[...stage.current.querySelectorAll('button')];
    swapping.current=true;
    stage.current.dataset.swapping='true';
    // Phone centers follow opposite halves of a tilted ellipse.
    const width=stage.current.clientWidth;
    const cardWidth=cards[0].offsetWidth;
    const left=cards[0].offsetLeft;
    const height=stage.current.clientHeight;
    const cardHeight=cards[0].offsetHeight;
    const desktopScale=Math.min(.78,height*.36/cardHeight);
    const separated=cards.map((card,i)=>`translate(${width*.52-left-cardWidth/2}px, ${height*(i===selected?.76:.24)-card.offsetTop-cardHeight/2}px) rotate(${i===selected?-5:5}deg) scale(${desktopScale})`);
    const orbitFrames=(i,start,end)=>Array.from({length:33},(_,step)=>{
      const t=start+(end-start)*step/32;
      const angle=Math.PI*t;
      const direction=i===selected?1:-1;
      const x=direction*(-.24*cardWidth*Math.cos(angle)-.22*width*Math.sin(angle));
      const y=.07*cardHeight+direction*(.08*cardHeight*Math.cos(angle)-.1*height*Math.sin(angle));
      const rotation=.5-direction*8.5*Math.cos(angle);
      const scale=1-.28*Math.sin(angle)**2;
      return {transform:`translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,offset:step/32};
    });
    try{
      animations.current=cards.map((card,i)=>card.animate(mobile?orbitFrames(i,0,.5):[{transform:getComputedStyle(card).transform},{transform:separated[i]}],{duration:mobile?600:380,easing:mobile?'cubic-bezier(.42,0,1,1)':'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}));
      await Promise.all(animations.current.map(a=>a.finished));
      flushSync(()=>setSelected(index));
      animations.current.forEach(a=>a.cancel());
      const destinations=cards.map(card=>getComputedStyle(card).transform);
      animations.current=cards.map((card,i)=>card.animate(mobile?orbitFrames(i,.5,1):[{transform:separated[i]},{transform:destinations[i]}],{duration:mobile?600:560,easing:mobile?'cubic-bezier(0,0,.58,1)':'cubic-bezier(.16,1,.3,1)',fill:'forwards'}));
      await Promise.all(animations.current.map(a=>a.finished));
    }catch{}finally{
      animations.current.forEach(a=>a.cancel());animations.current=[];
      delete stage.current?.dataset.swapping;swapping.current=false;
    }
  }

  useEffect(() => {
    if (expanded) focus.current?.scrollIntoView({ block: 'nearest', behavior: animateSwaps ? 'smooth' : 'instant' });
  }, [expanded,animateSwaps]);

  function move(event) {
    if (!animateSwaps || swapping.current || (tiltEnabled&&event.pointerType!=='mouse')) return;
    const box = event.currentTarget.getBoundingClientRect();
    stage.current.style.setProperty('--rx', `${((event.clientY - box.top) / box.height - .5) * -7}deg`);
    stage.current.style.setProperty('--ry', `${((event.clientX - box.left) / box.width - .5) * 10}deg`);
  }

  function reset() {
    stage.current.style.setProperty('--rx', '0deg');
    stage.current.style.setProperty('--ry', '0deg');
  }

  return <section id="top" className={styles.experience} data-type="artistic" data-animate-swaps={animateSwaps} aria-labelledby="opening">
    {mobile&&process.env.NODE_ENV==='development'&&<label className={styles.typeStudy}>2D orbit lettering <select value={textPreset} onChange={e=>setTextPreset(e.target.value)}>{['Single font','Two fonts','Previous options'].map(group=><optgroup label={group} key={group}>{orbitOptions.filter(option=>option.group===group).map(option=><option value={option.id} key={option.id}>{option.label}</option>)}</optgroup>)}</select></label>}
    <div className={styles.composition}>
      <div className={styles.title}>
        <h1 id="opening">Websites built around <em>your business.</em></h1>
        <a href="#contact">Get in touch <span>↗</span></a>
      </div>
      <div id="work" className={styles.gallery} onPointerMove={move} onPointerLeave={reset} onPointerUp={event=>{if(event.pointerType!=='mouse')reset();}} onPointerCancel={reset} ref={stage}>
        {mobile&&motionEnabled&&<CurvedType3D onReady={setTypeReady} preset={textPreset}/>}
        <svg className={styles.arcHeadline} style={mobile&&motionEnabled&&typeReady?{visibility:'hidden'}:undefined} viewBox="0 0 600 800" aria-hidden="true" focusable="false">
          <defs><path id="headline-top-arc" d="M 40 190 A 260 175 0 0 1 560 190"/><path id="headline-bottom-arc" d="M 40 605 A 260 175 0 0 0 560 605"/></defs>
          <text className={styles.arcTop}><textPath href="#headline-top-arc" startOffset="50%" textAnchor="middle">Websites built around</textPath></text>
          <text className={styles.arcBottom}><textPath href="#headline-bottom-arc" startOffset="50%" textAnchor="middle">your business.</textPath></text>
        </svg>
        <div className={styles.planes}>
          {projects.map((item, i) => <button key={item.title} data-depth-role={selected===i?'front':'rear'} style={{zIndex:selected===i?3:1}} className={`${styles.projectPlane} ${selected === i ? styles.front : styles.back}`} onClick={() => { if(swapping.current)return; if (selected === i) setExpanded(v => !v); else selectProject(i); }} aria-label={selected === i ? `${expanded ? 'Close' : 'Explore'} ${item.title}` : `Select ${item.title}`} aria-expanded={selected === i ? expanded : undefined}>
            <span className={styles.browserChrome} aria-hidden="true">
              <span className={styles.tabRow}><span className={styles.windowDots}><i/><i/><i/></span><span className={styles.browserTab}><span className={styles.favicon}>{i===0?'B':'L'}</span>{item.title}<span>×</span></span><span className={styles.newTab}>+</span></span>
              <span className={styles.addressRow}><span className={styles.browserArrows}>← &nbsp; → &nbsp; ↻</span><span className={styles.address}>⌁ &nbsp; {i===0?'bigbasstrees.com':'libertyhousespecialties.com'}</span><span>···</span></span>
            </span>
            <picture>
              <source media="(max-width: 800px)" srcSet={`/images/projects/${i === 0 ? 'bigbass' : 'liberty'}-mobile.webp`} />
              <img src={images[i]} alt={`${item.title} website`} width={1920} height={1080} loading={i === 0 ? 'eager' : 'lazy'} />
            </picture>
            <span className={styles.caption}>{item.blocks[0].text}<span>{selected === i ? 'Explore project ↗' : 'View project ↗'}</span></span>
          </button>)}
        </div>
      </div>
    </div>
    <div className={styles.selection}>
      <span>Selected work</span>
      <div aria-label="Choose a project">{projects.map((item, i) => <button key={item.title} aria-pressed={selected === i} onClick={() => selectProject(i)}><span className={styles.brandAsset}><img src={brandImages[i]} alt="" width={96} height={96}/></span><span className={styles.projectLabel}>{item.title}</span><span className={styles.projectKind}>{i===0?'Tree care & business tools':'Restaurant & menu'}</span><span className={styles.projectChoice}>{selected===i?'On display':'Select project'}<span aria-hidden="true">{selected===i?'✓':'↗'}</span></span></button>)}</div>
      <button className={styles.explore} aria-expanded={expanded} aria-controls="project-focus" onClick={() => setExpanded(v => !v)}>{expanded ? 'Close project' : 'Explore project'} <span>{expanded ? '−' : '+'}</span></button>
    </div>
    <AccessibilityTray motionMode={motionMode} onMotionChange={value => { onMotionChange?.(value); reset(); }} tiltEnabled={tiltEnabled} tiltMessage={tiltMessage} onTiltToggle={toggleTilt} motionEnabled={motionEnabled}/>
    <div id="project-focus" ref={focus} hidden={!expanded} className={styles.focus} aria-labelledby="project-title">
      <header className={styles.caseHeader}>
        <div className={styles.caseMasthead}><span>Project spotlight</span><span>{selected===0?'Service business':'Hospitality'}</span></div>
        <div className={styles.caseIdentity}><h2 id="project-title">{selected===0?'Big Bass':'Liberty House'}<em>{selected===0?'Tree Service':'Specialties'}</em></h2><div className={styles.caseBrand}><img src={brandImages[selected]} alt="" width={120} height={120}/></div></div>
        <p className={styles.caseSubtitle}>{project.blocks[0].text}</p>
      </header>
      <div className={styles.caseStory}><h3>The brief <em>&amp; the build.</em></h3><p>{project.blocks[1].text}</p><a href={urls[selected]} target="_blank" rel="noreferrer">{project.blocks.at(-1).text}<span aria-hidden="true">↗</span></a></div>
      <div className={styles.caseScope}><span className={styles.caseEyebrow}>Behind the website</span><h3>What went <em>into it.</em></h3><p>{project.blocks[2].text}</p><ul>{project.blocks.filter(item => item.kind === 'li').map(item => <li key={item.text}><span aria-hidden="true">↗</span>{item.text}</li>)}</ul></div>
      {expanded && <ProjectGallery key={selected} projectIndex={selected} title={project.title} />}
    </div>
  </section>;
}
