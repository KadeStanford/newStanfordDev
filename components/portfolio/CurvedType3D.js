import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import sansData from 'three/examples/fonts/helvetiker_regular.typeface.json';
import serifData from 'three/examples/fonts/optimer_regular.typeface.json';
import boldData from 'three/examples/fonts/helvetiker_bold.typeface.json';
import sculptData from 'three/examples/fonts/gentilis_regular.typeface.json';

export default function CurvedType3D({ onReady, preset='metal' }) {
 const host=useRef(null);
 useEffect(()=>{
  const node=host.current;let renderer,frame,visible=true,disposed=false;
  const geometries=[];const materials=[];const letters=[];
  const pairing={metal:[sansData,serifData],bold:[boldData,sculptData],sculptural:[sculptData,sansData],editorial:[serifData,boldData]}[preset]||[sansData,serifData];
  onReady(false);
  const fail=()=>onReady(false);
  try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
   renderer.setClearColor(0x000000,0);
   // Drawing-buffer resolution must not enlarge the canvas's CSS layout box.
   Object.assign(renderer.domElement.style,{display:'block',width:'100%',height:'100%',position:'absolute',inset:'0',zIndex:1,pointerEvents:'none'});
   const rear=document.createElement('canvas');Object.assign(rear.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:0});node.appendChild(rear);const rearContext=rear.getContext('2d');
   // Share the phones' stacking context: rear phone (1), text (1, later
   // DOM order), front phone (2). The front silhouette always occludes text.
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
   const resize=()=>{const {width,height}=node.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);rear.width=renderer.domElement.width;rear.height=renderer.domElement.height;const aspect=width/height;const w=Math.max(600,800*aspect),h=w/aspect;camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();};
   const observer=new ResizeObserver(resize);observer.observe(node);resize();
   let ready=false;
   let phase=0,lastTime=null;const world=new THREE.Vector3();const corner=new THREE.Vector3();
   const phones=[...node.parentElement.querySelectorAll('button')];
   // Never change a letter's stacking layer while it overlaps a phone.
   // Project all four glyph corners, including the tilted orbit, to screen space.
   function overlapsPhone(mesh,stageBox,phoneBoxes){
    const bounds=mesh.geometry.boundingBox;let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y]){
     corner.set(x,y,0).applyMatrix4(mesh.matrixWorld).project(camera);
     const px=stageBox.left+(corner.x+1)*stageBox.width/2,py=stageBox.top+(1-corner.y)*stageBox.height/2;
     left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
    }
    return phoneBoxes.some(box=>left<box.right+14&&right>box.left-14&&top<box.bottom+14&&bottom>box.top-14);
   }
   function render(time){if(disposed)return;const delta=lastTime===null?0:Math.min((time-lastTime)/1000,.05);lastTime=time;if(visible&&!document.hidden){phase+=delta*Math.PI*2/38;const style=getComputedStyle(node.parentElement);group.rotation.x=.22+(parseFloat(style.getPropertyValue('--rx'))||0)*Math.PI/180;group.rotation.y=-.30+(parseFloat(style.getPropertyValue('--ry'))||0)*Math.PI/180;
    letters.forEach(({mesh,angle,bottom})=>{const theta=angle+phase;mesh.position.set(265*Math.sin(theta),330*Math.cos(theta),0);mesh.rotation.z=Math.atan2(-330*Math.sin(theta),265*Math.cos(theta))+(bottom?Math.PI:0);});group.updateMatrixWorld(true);
    const stageBox=node.getBoundingClientRect(),phoneBoxes=phones.map(phone=>phone.getBoundingClientRect());
    letters.forEach(({mesh})=>{mesh.getWorldPosition(world);const overlapping=overlapsPhone(mesh,stageBox,phoneBoxes);if(mesh.userData.front===undefined)mesh.userData.front=!overlapping&&world.z>=0;else if(!overlapping)mesh.userData.front=world.z>=0;mesh.visible=!mesh.userData.front;});renderer.render(scene,camera);rearContext.clearRect(0,0,rear.width,rear.height);rearContext.drawImage(renderer.domElement,0,0);
    letters.forEach(({mesh})=>{mesh.visible=mesh.userData.front;});renderer.render(scene,camera);if(!ready){ready=true;onReady(true);}}frame=requestAnimationFrame(render);}
   const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});intersection.observe(node);
   renderer.domElement.addEventListener('webglcontextlost',fail);frame=requestAnimationFrame(render);
   return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();renderer.domElement.removeEventListener('webglcontextlost',fail);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();node.replaceChildren();};
  }catch{renderer?.dispose();renderer?.domElement.remove();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());fail();}
 },[onReady,preset]);
 return <div ref={host} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none'}}/>;
}
