import Image from 'next/image';
import styles from '../../styles/Education.module.css';

export default function Education() {
 return <figure className={styles.education}>
  <div className={styles.photo}><Image src="/images/kade-graduation.webp" alt="Kade in graduation regalia outside Southeastern Louisiana University’s Science & Technology Building" width={1400} height={1639} sizes="(max-width:800px) 90vw, 32vw"/></div>
  <figcaption><span>Education / December 2025</span><h3>B.S. in<br/>Information Technology</h3><p>Southeastern Louisiana University</p></figcaption>
 </figure>;
}
