import { useEffect } from 'react';
import styles from '../../styles/PageMotion.module.css';

export default function PageMotion(){
 useEffect(()=>{
  const page=document.querySelector('[data-portfolio]');
  if(!page||!('IntersectionObserver' in window))return;
  const elements=page.querySelectorAll('main > section:not(#top), #about figure, #contact');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add(styles.visible);observer.unobserve(entry.target);}}),{threshold:0,rootMargin:'0px 0px -35px 0px'});
  elements.forEach(el=>{if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add(styles.reveal);observer.observe(el);}});
  return()=>{observer.disconnect();elements.forEach(el=>el.classList.remove(styles.reveal,styles.visible));};
 },[]);
 return null;
}
