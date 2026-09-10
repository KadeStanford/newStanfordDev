import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, FileText, RotateCcw, Check } from 'lucide-react';
import styles from '../../styles/WorkflowLab.module.css';

const stages = ['Request', 'Estimate', 'Invoice'];
export default function WorkflowLab() {
 const [step,setStep]=useState(0);
 const [units,setUnits]=useState(3);
 const reduced=useReducedMotion();
 const total=units*40;
 const advance=()=>setStep(s=>Math.min(2,s+1));
 return <section className={styles.lab} aria-labelledby="lab-title">
  <div className={styles.heading}><span>01 / Interactive example</span><h2 id="lab-title">Less paperwork.<br/><em>Try it yourself.</em></h2><p>A sample request, an estimate, an invoice. Explore how a small tool can connect the steps.</p></div>
  <div className={styles.stage}>
   <div className={styles.topline}><span>SDS / Workflow lab</span><span>Demo only · nothing is sent</span></div>
   <div className={styles.track} aria-label="Workflow stages">{stages.map((label,i)=><button key={label} onClick={()=>setStep(i)} aria-current={step===i?'step':undefined}><span>{step>i?<Check size={14}/>: `0${i+1}`}</span>{label}</button>)}</div>
   <div className={styles.workspace}>
    <div className={styles.orbit} aria-hidden="true"/>
    <span className={styles.watermark} aria-hidden="true">0{step+1}</span>
    <AnimatePresence mode="wait">
     <motion.div key={step} className={styles.document} drag={reduced?false:'x'} dragConstraints={{left:0,right:0}} dragElastic={.3} onDragEnd={(_,info)=>{if(Math.abs(info.offset.x)>70)advance();}} initial={reduced?false:{opacity:0,y:35,rotate:-5,scale:.94}} animate={{opacity:1,y:0,rotate:step===1?2:-2,scale:1}} exit={reduced?{opacity:0}:{opacity:0,x:120,rotate:12,scale:.9}} transition={{type:'spring',stiffness:240,damping:25}}>
      <div className={styles.dochead}><FileText size={23}/><span>Sample {stages[step].toLowerCase()}<small>DEMO–001 / NOT A REAL DOCUMENT</small></span></div>
      <h3>{step===0?'A little help outside.':step===1?'Here’s the estimate.':'Ready for the next step.'}</h3>
      <p>{step===0?'Example request: seasonal garden cleanup.':step===1?'The request becomes an editable scope and price.':'The same details carry into a sample invoice.'}</p>
      <div className={styles.line}><span>Garden cleanup</span><span>{units} hours</span></div>
      <div className={styles.line}><span>Illustrative hourly rate</span><span>$40</span></div>
      <div className={styles.total}><span>Sample total</span><strong>${total}</strong></div>
      <span className={styles.stamp}>{step===0?'Request received':step===1?'Draft estimate':'Unsent invoice'}</span>
     </motion.div>
    </AnimatePresence>
   </div>
   <div className={styles.controls}><label htmlFor="demo-hours">Adjust the sample scope <span>{units} hours</span><input id="demo-hours" type="range" min="1" max="8" value={units} onChange={e=>setUnits(Number(e.target.value))}/></label><button onClick={step===2?()=>setStep(0):advance}>{step===0?'Create estimate':step===1?'Create sample invoice':'Try again'}{step===2?<RotateCcw size={18}/>:<ArrowRight size={18}/>}</button></div>
   <p className={styles.status} aria-live="polite">{stages[step]} · Sample total ${total}. All data stays in this demo.</p>
  </div>
 </section>;
}
