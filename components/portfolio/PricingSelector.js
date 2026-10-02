import { useState } from 'react';
import styles from '../../styles/PricingSelector.module.css';
const groups=[{name:'Websites',items:[0,1,2,3]},{name:'Advertising',items:[6,7,8]},{name:'Creative',items:[9]}];
export default function PricingSelector({copy}){
 const [group,setGroup]=useState(0),[selected,setSelected]=useState(0);
 const entry=copy.Pricing.entries[selected];
 const [name,price]=entry.title.split(' — ');
 const summary=entry.blocks[0]?.kind!=='li'?entry.blocks[0]?.text:null;
 const scope=summary?entry.blocks.slice(1):entry.blocks;
 return <section id="pricing" className={styles.section} aria-labelledby="pricing-heading">
  <header><span>Services &amp; Pricing</span><h2 id="pricing-heading">{copy.Pricing.blocks[0].text}</h2><p>{copy.Pricing.blocks[1].text}</p></header>
  <div className={styles.categories} role="group" aria-label="Service category">{groups.map((item,i)=><button key={item.name} aria-pressed={group===i} onClick={()=>{setGroup(i);setSelected(item.items[0]);}}>{item.name}</button>)}</div>
  <div className={styles.display}>
   <div className={styles.rail} role="group" aria-label="Choose a package">{groups[group].items.map(i=><button key={i} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{copy.Pricing.entries[i].title.split(' — ')[0]}</span><b aria-hidden="true">{selected===i?'✓':'+'}</b></button>)}<p>Select a package to see its scope.</p></div>
   <article key={selected} className={styles.package} aria-label="Selected package" aria-live="polite">
    <div className={styles.offer}><h3>{name}</h3><p className={styles.price}>{price}</p>{summary&&<p className={styles.offerSummary}>{summary}</p>}<a href="#contact">Get in touch <span>↗</span></a></div>
    <div className={styles.scope}>{scope.map((block,i)=>block.kind==='li'?<p className={styles.item} key={i}><span aria-hidden="true">↳</span>{block.text}</p>:<p key={i}>{block.text}</p>)}</div>
    {group===0&&<aside className={styles.care}><h4>Optional hosting <span>$75 per month</span></h4>{copy.Pricing.entries[4].blocks.map((block,i)=><p key={`hosting-${i}`}>{block.text}</p>)}<h4 className={styles.careHeading}>Optional care &amp; hosting <span>$175 per month</span></h4><p>Available for websites I build, not as a standalone service for existing sites.</p>{copy.Pricing.entries[5].blocks.map((block,i)=><p key={i}>{block.text}</p>)}</aside>}
   </article>
  </div>
  <p className={styles.note}>{copy.Pricing.note}</p>
  <div className={styles.serviceContext}><h3>{copy.Services.blocks[0].text}</h3><p>{copy.Opening.blocks[2].text}</p></div>
 </section>;
}
