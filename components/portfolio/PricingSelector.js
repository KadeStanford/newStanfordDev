import { useState } from 'react';
import styles from '../../styles/PricingSelector.module.css';
const groups=[{name:'Websites',items:[0,1,2]},{name:'Care',items:[3]},{name:'Advertising',items:[4,5,6]},{name:'Creative',items:[7]}];
export default function PricingSelector({copy}){
 const [group,setGroup]=useState(0),[selected,setSelected]=useState(0);
 const entry=copy.Pricing.entries[selected];
 const [name,price]=entry.title.split(' — ');
 return <section id="pricing" className={styles.section} aria-labelledby="pricing-heading">
  <header><span>02 / Services &amp; Pricing</span><h2 id="pricing-heading">{copy.Pricing.blocks[0].text}</h2><p>{copy.Pricing.blocks[1].text}</p></header>
  <div className={styles.categories} role="group" aria-label="Service category">{groups.map((item,i)=><button key={item.name} aria-pressed={group===i} onClick={()=>{setGroup(i);setSelected(item.items[0]);}}>{item.name}<span>0{i+1}</span></button>)}</div>
  <div className={styles.display}>
   <div className={styles.rail} role="group" aria-label="Choose a package">{groups[group].items.map(i=><button key={i} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{copy.Pricing.entries[i].title.split(' — ')[0]}</span><b aria-hidden="true">↗</b></button>)}<p>Select a package to see its scope.</p></div>
   <article className={styles.package} aria-label="Selected package" aria-live="polite">
    <div className={styles.offer}><span className={styles.index} aria-hidden="true">0{selected+1}</span><h3>{name}</h3><p className={styles.price}>{price}</p><a href="#contact">Get in touch <span>↗</span></a></div>
    <div className={styles.scope}>{entry.blocks.map((block,i)=>block.kind==='li'?<p className={styles.item} key={i}><span aria-hidden="true">↳</span>{block.text}</p>:<p key={i}>{block.text}</p>)}</div>
   </article>
  </div>
  <p className={styles.note}>{copy.Pricing.note}</p>
  <div className={styles.serviceContext}><h3>{copy.Services.blocks[0].text}</h3><p>{copy.Services.blocks[1].text}</p></div>
 </section>;
}
