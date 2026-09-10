import { useEffect, useRef, useState } from 'react';
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
          {projects.map((item, i) => <button key={item.title} className={`${styles.projectPlane} ${selected === i ? styles.front : styles.back}`} onClick={() => { if (selected === i) setExpanded(v => !v); else setSelected(i); }} aria-label={selected === i ? `${expanded ? 'Close' : 'Explore'} ${item.title}` : `Select ${item.title}`} aria-expanded={selected === i ? expanded : undefined}>
            <span className={styles.frame}><span>0{i + 1} / {item.title}</span><span>↗</span></span>
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
      <div aria-label="Choose a project">{projects.map((item, i) => <button key={item.title} aria-pressed={selected === i} onClick={() => setSelected(i)}><span>0{i + 1}</span>{item.title}<span>↗</span></button>)}</div>
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
