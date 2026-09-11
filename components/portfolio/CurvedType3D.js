import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import sansData from 'three/examples/fonts/helvetiker_regular.typeface.json';
import serifData from 'three/examples/fonts/optimer_regular.typeface.json';

export default function CurvedType3D({ onReady }) {
 const host=useRef(null);
 useEffect(()=>{
  const node=host.current;let renderer,frame,visible=true,disposed=false;
  const geometries=[];const materials=[];
  const fail=()=>onReady(false);
  try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
   renderer.setClearColor(0x000000,0);node.appendChild(renderer.domElement);
   const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-300,300,400,-400,.1,2000);camera.position.z=900;
   const group=new THREE.Group();scene.add(group);
   scene.add(new THREE.AmbientLight(0xffffff,1.5));
   const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-200,300,500);scene.add(key);
   const rim=new THREE.DirectionalLight(0xc8f06b,2);rim.position.set(300,-100,200);scene.add(rim);
   const loader=new FontLoader();
   function line(text,data,size,bottom){
    const font=loader.parse(data);const advances=[...text].map(c=>(font.data.glyphs[c]?.ha||350)*size/font.data.resolution+1);
    const total=advances.reduce((a,b)=>a+b,0);let cursor=-total/2;
    const front=new THREE.MeshStandardMaterial({color:bottom?0xc8f06b:0xe9f0e3,roughness:.32,metalness:.25});
    const edge=new THREE.MeshStandardMaterial({color:bottom?0x5c802c:0x637a6c,roughness:.4,metalness:.4});materials.push(front,edge);
    [...text].forEach((c,i)=>{const angle=(cursor+advances[i]/2)/total*(bottom?1.85:2.25);cursor+=advances[i];if(c===' ')return;
     const geometry=new TextGeometry(c,{font,size,depth:8,curveSegments:5,bevelEnabled:true,bevelThickness:1,bevelSize:.6,bevelSegments:2});geometry.computeBoundingBox();geometry.translate(-(geometry.boundingBox.max.x+geometry.boundingBox.min.x)/2,0,-4);geometries.push(geometry);
     const mesh=new THREE.Mesh(geometry,[front,edge]);mesh.position.set(260*Math.sin(angle),bottom?-155-185*Math.cos(angle):145+205*Math.cos(angle),0);mesh.rotation.z=Math.atan2((bottom?185:-205)*Math.sin(angle),260*Math.cos(angle));group.add(mesh);
    });
   }
   line('Websites built around',sansData,30,false);line('your business.',serifData,43,true);
   const resize=()=>{const {width,height}=node.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height;const w=Math.max(600,800*aspect),h=w/aspect;camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();};
   const observer=new ResizeObserver(resize);observer.observe(node);resize();
   let ready=false;
   function render(time){if(disposed)return;if(visible){const style=getComputedStyle(node.parentElement);group.rotation.x=.10+(parseFloat(style.getPropertyValue('--rx'))||0)*Math.PI/180;group.rotation.y=-.12+(parseFloat(style.getPropertyValue('--ry'))||0)*Math.PI/180+Math.sin(time*.00035)*.025;renderer.render(scene,camera);if(!ready){ready=true;onReady(true);}}frame=requestAnimationFrame(render);}
   const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});intersection.observe(node);
   renderer.domElement.addEventListener('webglcontextlost',fail);frame=requestAnimationFrame(render);
   return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();renderer.domElement.removeEventListener('webglcontextlost',fail);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();node.replaceChildren();};
  }catch{renderer?.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());fail();}
 },[onReady]);
 return <div ref={host} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:3}}/>;
}
