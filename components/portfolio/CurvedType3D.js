import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';

const fontFiles=['Bungee-Regular.ttf','DMSerifDisplay-Italic.ttf','Monoton-Regular.ttf','Italiana-Regular.ttf'];
let fontPromise;

export default function CurvedType3D({ onReady, preset='monoton' }) {
 const [fonts,setFonts]=useState(null);
 useEffect(()=>{
  let active=true;
  fontPromise??=Promise.all(fontFiles.map(async file=>{
   const response=await fetch(`/fonts/${file}`);
   if(!response.ok)throw new Error('Orbit font unavailable');
   return new TTFLoader().parse(await response.arrayBuffer());
  })).catch(error=>{fontPromise=null;throw error;});
  fontPromise.then(data=>{if(active)setFonts(data);}).catch(()=>{if(active)onReady(false);});
  return()=>{active=false;};
 },[onReady]);
 return fonts?<OrbitLettering onReady={onReady} preset={preset} fonts={fonts}/>:null;
}

function OrbitLettering({onReady,preset,fonts}) {
 const host=useRef(null);
 useEffect(()=>{
  const node=host.current;let renderer,frame,visible=true,disposed=false;
  const geometries=[];const materials=[];const letters=[];
  const [bungee,dmSerif,monoton,italiana]=fonts;
  const pairing={monoton:[monoton,monoton],metal:[bungee,dmSerif],bold:[monoton,dmSerif],sculptural:[bungee,italiana],editorial:[italiana,monoton]}[preset]||[monoton,monoton];
  onReady(false);
  const fail=()=>onReady(false);
  try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
   renderer.setClearColor(0x000000,0);
   // Drawing-buffer resolution must not enlarge the canvas's CSS layout box.
   Object.assign(renderer.domElement.style,{display:'block',width:'100%',height:'100%',position:'absolute',inset:'0',zIndex:2,pointerEvents:'none'});
   renderer.domElement.dataset.orbitLayer='middle';
   // Explicit roles update with selection at the swap midpoint:
   // rear phone (1), text (2), front phone (3), independent of DOM order.
   const phoneLayer=node.parentElement.querySelector('button')?.parentElement;
   (phoneLayer||node).appendChild(renderer.domElement);
   const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-300,300,400,-400,.1,2000);camera.position.z=900;
   const group=new THREE.Group();scene.add(group);
   const loader=new FontLoader();
   function line(text,data,size,bottom){
    const font=loader.parse(data);const advances=[...text].map(c=>(font.data.glyphs[c]?.ha||350)*size/font.data.resolution+1);
    const total=advances.reduce((a,b)=>a+b,0);let cursor=-total/2;
    const front=new THREE.MeshBasicMaterial({color:bottom?0xc8f06b:0xe9f0e3,side:THREE.DoubleSide});materials.push(front);
    [...text].forEach((c,i)=>{const angle=(cursor+advances[i]/2)/total*(bottom?1.85:2.25);cursor+=advances[i];if(c===' ')return;
     const geometry=new THREE.ShapeGeometry(font.generateShapes(c,size),8);geometry.computeBoundingBox();geometry.translate(-(geometry.boundingBox.max.x+geometry.boundingBox.min.x)/2,0,0);geometries.push(geometry);
     const mesh=new THREE.Mesh(geometry,front);group.add(mesh);letters.push({mesh,angle:bottom?Math.PI-angle:angle,bottom});
    });
   }
   line('Websites built around',pairing[0],30,false);line('your business.',pairing[1],39,true);
   const resize=()=>{const {width,height}=node.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height;const w=Math.max(600,800*aspect),h=w/aspect;camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();};
   const observer=new ResizeObserver(resize);observer.observe(node);resize();
   let ready=false;
   let phase=0,lastTime=null;
   function render(time){if(disposed)return;const delta=lastTime===null?0:Math.min((time-lastTime)/1000,.05);lastTime=time;if(visible&&!document.hidden){phase+=delta*Math.PI*2/38;const style=getComputedStyle(node.parentElement);group.rotation.x=.22+(parseFloat(style.getPropertyValue('--rx'))||0)*Math.PI/180;group.rotation.y=-.30+(parseFloat(style.getPropertyValue('--ry'))||0)*Math.PI/180;
    letters.forEach(({mesh,angle,bottom})=>{const theta=angle+phase;mesh.position.set(265*Math.sin(theta),330*Math.cos(theta),0);mesh.rotation.z=Math.atan2(-330*Math.sin(theta),265*Math.cos(theta))+(bottom?Math.PI:0);});group.updateMatrixWorld(true);
    // The entire orbit lives between the dynamically assigned phone roles.
    // Its far arc must not be routed behind the rear phone.
    renderer.render(scene,camera);if(!ready){ready=true;onReady(true);}}frame=requestAnimationFrame(render);}
   const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});intersection.observe(node);
   renderer.domElement.addEventListener('webglcontextlost',fail);frame=requestAnimationFrame(render);
   return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();renderer.domElement.removeEventListener('webglcontextlost',fail);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();node.replaceChildren();};
  }catch{renderer?.dispose();renderer?.domElement.remove();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());fail();}
 },[onReady,preset,fonts]);
 return <div ref={host} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none'}}/>;
}
