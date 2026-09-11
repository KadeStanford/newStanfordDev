import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { orbitFonts, orbitOptions } from './orbitFonts';

const fontPromises=new Map();
function loadFont(id){
 if(!fontPromises.has(id)){
  const face=new FontFace(`Orbit-${id}`,`url(/fonts/${orbitFonts[id]})`);
  fontPromises.set(id,face.load().then(loaded=>{document.fonts.add(loaded);return id;}).catch(error=>{fontPromises.delete(id);throw error;}));
 }
 return fontPromises.get(id);
}

export default function CurvedType3D({ onReady, preset='bungee-monoton' }) {
 const [fonts,setFonts]=useState(null);
 useEffect(()=>{
  let active=true;
  onReady(false);setFonts(null);
  const option=orbitOptions.find(option=>option.id===preset)||orbitOptions[0];
  Promise.all(option.fonts.map(loadFont)).then(data=>{if(active)setFonts(data);}).catch(()=>{if(active)onReady(false);});
  return()=>{active=false;};
 },[onReady,preset]);
 return fonts?<OrbitLettering onReady={onReady} preset={preset} fonts={fonts}/>:null;
}

function OrbitLettering({onReady,preset,fonts}) {
 const host=useRef(null);
 useEffect(()=>{
  const node=host.current;let renderer,frame,visible=true,disposed=false;
  const geometries=[];const materials=[];const textures=[];const letters=[];
  onReady(false);
  const fail=()=>onReady(false);
  try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
   renderer.setClearColor(0x000000,0);
   // Drawing-buffer resolution must not enlarge the canvas's CSS layout box.
   Object.assign(renderer.domElement.style,{display:'block',width:'100%',height:'100%',position:'absolute',inset:'0',zIndex:2,pointerEvents:'none'});
   renderer.domElement.dataset.orbitLayer='middle';
   renderer.domElement.dataset.fontPreset=preset;
   // Explicit roles update with selection at the swap midpoint:
   // rear phone (1), text (2), front phone (3), independent of DOM order.
   const phoneLayer=node.parentElement.querySelector('button')?.parentElement;
   (phoneLayer||node).appendChild(renderer.domElement);
   const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-300,300,400,-400,.1,2000);camera.position.z=900;
   const group=new THREE.Group();scene.add(group);
   function line(text,font,size,bottom){
    // Native font rasterization preserves nested counters/stripes that the
    // previous TTF-to-triangle conversion filled incorrectly (notably B/D).
    const resolution=4,padding=8*resolution;
    const measure=document.createElement('canvas').getContext('2d');
    const fontStyle=`${size*resolution}px "Orbit-${font}"`;
    measure.font=fontStyle;
    const advances=[...text].map(c=>measure.measureText(c).width/resolution+1);
    const total=advances.reduce((a,b)=>a+b,0);let cursor=-total/2;
    [...text].forEach((c,i)=>{const angle=(cursor+advances[i]/2)/total*(bottom?1.85:2.25);cursor+=advances[i];if(c===' ')return;
     const metrics=measure.measureText(c),canvas=document.createElement('canvas');
     canvas.width=Math.ceil(metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight)+padding*2;
     canvas.height=Math.ceil(metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent)+padding*2;
     const context=canvas.getContext('2d');context.font=fontStyle;context.fillStyle='#fff';
     const x=padding+metrics.actualBoundingBoxLeft,y=padding+metrics.actualBoundingBoxAscent;
     // Bake contrast into each glyph so it remains inside the phone depth
     // layers. Extra texture padding prevents the shadow being cropped.
     context.strokeStyle='#080e12';context.lineWidth=2.6*resolution;context.lineJoin='round';
     context.shadowColor='rgba(0,0,0,.8)';context.shadowBlur=3*resolution;context.shadowOffsetY=1.5*resolution;
     context.strokeText(c,x,y);
     context.shadowColor='transparent';context.fillText(c,x,y);
     const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
     const front=new THREE.MeshBasicMaterial({map:texture,color:bottom?0xc8f06b:0xe9f0e3,side:THREE.DoubleSide,transparent:true,depthWrite:false});materials.push(front);
     const geometry=new THREE.PlaneGeometry(canvas.width/resolution,canvas.height/resolution);
     geometry.translate(0,(metrics.actualBoundingBoxAscent-metrics.actualBoundingBoxDescent)/resolution/2,0);geometries.push(geometry);
     const mesh=new THREE.Mesh(geometry,front);group.add(mesh);letters.push({mesh,angle:bottom?Math.PI-angle:angle,bottom});
    });
   }
   line('Websites built around',fonts[0],40,false);line('your business.',fonts[1],52,true);
   const resize=()=>{const {width,height}=node.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height;const w=Math.max(600,800*aspect),h=w/aspect;camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();};
   const observer=new ResizeObserver(resize);observer.observe(node);resize();
   let ready=false;
   let phase=0,lastTime=null;
   function render(time){if(disposed||!node.isConnected)return;const delta=lastTime===null?0:Math.min((time-lastTime)/1000,.05);lastTime=time;if(visible&&!document.hidden){phase+=delta*Math.PI*2/38;const style=getComputedStyle(node.parentElement);group.rotation.x=.22+(parseFloat(style.getPropertyValue('--rx'))||0)*Math.PI/180;group.rotation.y=-.30+(parseFloat(style.getPropertyValue('--ry'))||0)*Math.PI/180;
    letters.forEach(({mesh,angle,bottom})=>{const theta=angle+phase;mesh.position.set(265*Math.sin(theta),330*Math.cos(theta),0);mesh.rotation.z=Math.atan2(-330*Math.sin(theta),265*Math.cos(theta))+(bottom?Math.PI:0);});group.updateMatrixWorld(true);
    // The entire orbit lives between the dynamically assigned phone roles.
    // Its far arc must not be routed behind the rear phone.
    renderer.render(scene,camera);if(!ready){ready=true;onReady(true);}}frame=requestAnimationFrame(render);}
   const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});intersection.observe(node);
   renderer.domElement.addEventListener('webglcontextlost',fail);frame=requestAnimationFrame(render);
   return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();renderer.domElement.removeEventListener('webglcontextlost',fail);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();node.replaceChildren();};
  }catch{renderer?.dispose();renderer?.domElement.remove();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());fail();}
 },[onReady,preset,fonts]);
 return <div ref={host} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none'}}/>;
}
