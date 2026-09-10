import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import AccessibilityTray from './AccessibilityTray';
import ProjectGallery from './ProjectGallery';
import styles from '../../styles/ProjectStage.module.css';

const images = ['/images/projects/bigbass-home.webp', '/images/projects/liberty-home.webp'];
const urls = ['https://www.bigbasstrees.com/', 'https://libertyhousespecialties.com/'];

export default function ProjectStage({ copy, motionEnabled=true, motionMode='system', onMotionChange }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const animateSwaps=motionEnabled;
  const stage = useRef(null);
  const projects = copy['Selected work'].entries;
  const project = projects[selected];
  const focus = useRef(null);
  const swapping = useRef(false);
  const animations = useRef([]);
  useEffect(()=>()=>animations.current.forEach(animation=>animation.cancel()),[]);
  useEffect(()=>{if(!animateSwaps)animations.current.forEach(animation=>animation.finish());},[animateSwaps]);

  async function selectProject(index){
    if(index===selected||swapping.current)return;
    if(!animateSwaps||!window.matchMedia('(max-width:800px)').matches){setSelected(index);return;}
    const cards=[...stage.current.querySelectorAll('button')];
    swapping.current=true;
    stage.current.dataset.swapping='true';
    // Narrow phones shrink briefly so both silhouettes can clear each other.
    const width=stage.current.clientWidth;
    const cardWidth=cards[0].offsetWidth;
    const left=cards[0].offsetLeft;
    const scale=Math.min(.88,(width*.43)/cardWidth);
    const xLeft=width*.25-left-cardWidth/2;
    const xRight=width*.75-left-cardWidth/2;
    const separated=cards.map((_,i)=>`translate(${i===selected?xLeft:xRight}px, ${i===selected?65:10}px) rotate(${i===selected?-12:12}deg) scale(${scale})`);
    try{
      animations.current=cards.map((card,i)=>card.animate([{transform:getComputedStyle(card).transform},{transform:separated[i]}],{duration:380,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}));
      await Promise.all(animations.current.map(a=>a.finished));
      flushSync(()=>setSelected(index));
      animations.current.forEach(a=>a.cancel());
      const destinations=cards.map(card=>getComputedStyle(card).transform);
      animations.current=cards.map((card,i)=>card.animate([{transform:separated[i]},{transform:destinations[i]}],{duration:560,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'}));
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
    if (!animateSwaps || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    stage.current.style.setProperty('--rx', `${((event.clientY - box.top) / box.height - .5) * -7}deg`);
    stage.current.style.setProperty('--ry', `${((event.clientX - box.left) / box.width - .5) * 10}deg`);
  }

  function reset() {
    stage.current.style.setProperty('--rx', '0deg');
    stage.current.style.setProperty('--ry', '0deg');
  }

  return <section id="top" className={styles.experience} data-animate-swaps={animateSwaps} aria-labelledby="opening">
    <div className={styles.composition}>
      <div className={styles.title}>
        <h1 id="opening">A better website<br/>should make running<br/>your business <em>easier.</em></h1>
        <a href="#contact">Get in touch <span>↗</span></a>
      </div>
      <div id="work" className={styles.gallery} onPointerMove={move} onPointerLeave={reset} ref={stage}>
        <span className={styles.index} aria-hidden="true">0{selected + 1}</span>
        <div className={styles.planes}>
          {projects.map((item, i) => <button key={item.title} className={`${styles.projectPlane} ${selected === i ? styles.front : styles.back}`} onClick={() => { if(swapping.current)return; if (selected === i) setExpanded(v => !v); else selectProject(i); }} aria-label={selected === i ? `${expanded ? 'Close' : 'Explore'} ${item.title}` : `Select ${item.title}`} aria-expanded={selected === i ? expanded : undefined}>
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
      <span>Selected work / 01—02</span>
      <div aria-label="Choose a project">{projects.map((item, i) => <button key={item.title} aria-pressed={selected === i} onClick={() => selectProject(i)}><span>0{i + 1}</span>{item.title}<span>↗</span></button>)}</div>
      <button className={styles.explore} aria-expanded={expanded} aria-controls="project-focus" onClick={() => setExpanded(v => !v)}>{expanded ? 'Close project' : 'Explore project'} <span>{expanded ? '−' : '+'}</span></button>
    </div>
    <AccessibilityTray motionMode={motionMode} onMotionChange={value => { onMotionChange?.(value); reset(); }} />
    <div id="project-focus" ref={focus} hidden={!expanded} className={styles.focus}>
      <div aria-live="polite"><span>0{selected + 1} / {project.blocks[0].text}</span><h2>{project.title}</h2><p>{project.blocks[1].text}</p><a href={urls[selected]} target="_blank" rel="noreferrer">{project.blocks.at(-1).text} ↗</a></div>
      <div><h3>What I built</h3><p>{project.blocks[2].text}</p><ul>{project.blocks.filter(item => item.kind === 'li').map(item => <li key={item.text}>{item.text}</li>)}</ul></div>
      {expanded && <ProjectGallery key={selected} projectIndex={selected} title={project.title} />}
    </div>
  </section>;
}
