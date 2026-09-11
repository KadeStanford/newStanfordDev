import { useEffect, useState } from 'react';
import { orbitAngles, orbitPose, orbitProjection } from './orbitGeometry';
import styles from '../../styles/ProjectStage.module.css';

export default function StaticOrbit({ hidden }) {
  const [letters, setLetters] = useState([]);
  useEffect(() => {
    let cancelled = false;
    async function prepare() {
      await Promise.all([document.fonts.load('40px OrbitRusso'), document.fonts.load('52px OrbitMonoton')]);
      const context = document.createElement('canvas').getContext('2d');
      const result = [];
      for (const [text, font, size, bottom] of [['Websites built around', 'OrbitRusso', 40, false], ['your business.', 'OrbitMonoton', 52, true]]) {
        context.font = `${size * 4}px ${font}`;
        const metrics = [...text].map(letter => context.measureText(letter));
        const angles = orbitAngles(metrics.map(metric => metric.width / 4 + 1), bottom);
        [...text].forEach((letter, i) => {
          if (letter === ' ') return;
          result.push({ letter, font, size, bottom, x: (metrics[i].actualBoundingBoxLeft - metrics[i].actualBoundingBoxRight) / 8, transform: `matrix(${orbitProjection(orbitPose(angles[i], bottom)).join(' ')})` });
        });
      }
      if (!cancelled) setLetters(result);
    }
    prepare().catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return <svg className={styles.arcHeadline} style={hidden ? { visibility: 'hidden' } : undefined} viewBox="0 0 600 800" aria-hidden="true" focusable="false">
    {letters.map((item, i) => <text key={i} transform={item.transform} x={item.x} y="0" style={{ fontFamily: item.font, fontSize: item.size, fontWeight: 400, fill: item.bottom ? '#c8f06b' : '#e9f0e3', stroke: '#080e12', strokeWidth: 2.6, paintOrder: 'stroke fill', strokeLinejoin: 'round' }}>{item.letter}</text>)}
  </svg>;
}
