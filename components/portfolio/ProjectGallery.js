import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import styles from '../../styles/ProjectGallery.module.css';

export const projectScreens = [
  [ ['bigbass-home', 'Homepage'], ['bigbass-services', 'Services'], ['bigbass-contact', 'Estimate request'] ],
  [ ['liberty-home', 'Homepage'], ['liberty-menu', 'Food and drink menu'], ['liberty-icecream', 'Ice cream page'] ],
];
export function screenshotUrl(name) { return `/images/projects/${name}.webp`; }

export default function ProjectGallery({ projectIndex, title }) {
  const [active, setActive] = useState(0);
  const items = projectScreens[projectIndex];
  const current = items[active];
  return <div className={styles.gallery}>
    <h3>Website gallery</h3>
    <Dialog.Root>
      <Dialog.Trigger asChild><button className={styles.preview} aria-label={`Enlarge ${title}: ${current[1]}`}><img src={screenshotUrl(current[0])} width="1920" height="1080" alt={`${title} — ${current[1]}`} loading="lazy"/><span>Enlarge screenshot ↗</span></button></Dialog.Trigger>
      <div className={styles.thumbnails} aria-label={`${title} screenshots`}>{items.map(([name, label], index) => <button key={name} aria-pressed={active === index} onClick={() => setActive(index)}><img src={screenshotUrl(name)} width="1920" height="1080" alt="" loading="lazy"/><span>{label}</span></button>)}</div>
      <Dialog.Portal><Dialog.Overlay className={styles.overlay}/><Dialog.Content className={styles.lightbox}>
        <Dialog.Title>{title} — {current[1]}</Dialog.Title><Dialog.Description>Screenshot of the public website.</Dialog.Description>
        <img src={screenshotUrl(current[0])} width="1920" height="1080" alt={`${title} — ${current[1]}`}/>
        <div className={styles.controls}><button onClick={() => setActive((active + items.length - 1) % items.length)}>← Previous</button><span>{active + 1} / {items.length}</span><button onClick={() => setActive((active + 1) % items.length)}>Next →</button><Dialog.Close asChild><button>Close ✕</button></Dialog.Close></div>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </div>;
}
