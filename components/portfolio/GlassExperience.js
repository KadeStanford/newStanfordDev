import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshTransmissionMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function makeSurface(){
 const geometry=new THREE.PlaneGeometry(1,1,100,120);
 const points=geometry.attributes.position;
 for(let i=0;i<points.count;i++){
  const u=points.getX(i)*2, v=points.getY(i)*2;
  const angle=v*1.7+u*.5;
  const radius=1.2+u*.65;
  points.setXYZ(i,Math.sin(angle)*radius,v*2.2+Math.cos(u*2.3)*.3,Math.cos(angle)*radius+Math.sin(u*12+v*2)*.055);
 }
 geometry.computeVertexNormals();
 return geometry;
}

function Sculpture({mode,paused,turn}){
 const group=useRef();
 const a=useRef();const b=useRef();const c=useRef();
 const geometry=useMemo(makeSurface,[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useFrame((state,dt)=>{
  if(!group.current)return;
  const delta=Math.min(dt,.05);
  group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,turn,4,delta);
  if(!paused)group.current.rotation.z=Math.sin(state.clock.elapsedTime*.3)*.08;
  [a,b,c].forEach((ref,i)=>{
   if(!ref.current)return;
   ref.current.position.x=THREE.MathUtils.damp(ref.current.position.x,(i-1)*(mode===1?1.25:.42),4,delta);
   ref.current.rotation.z=THREE.MathUtils.damp(ref.current.rotation.z,(i-1)*(mode===2?.7:.16),4,delta);
   ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,i*2.08+(mode===2?.7:0),4,delta);
  });
 });
 return <group ref={group} rotation={[.12,0,-.2]} scale={.94}>
  {[a,b,c].map((ref,i)=><mesh key={i} ref={ref} geometry={geometry}>
   <MeshTransmissionMaterial resolution={256} samples={4} transmission={.96} thickness={.24} roughness={.13} chromaticAberration={.025} anisotropicBlur={.12} color={['#acd8ef','#8cbbd9','#d1c4dd'][i]} side={THREE.DoubleSide} temporalDistortion={0}/>
  </mesh>)}
 </group>;
}

class RenderBoundary extends Component{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onFailure();}
 render(){return this.state.failed?null:this.props.children;}
}

export default function GlassExperience({mode,paused,turn,onFailure}){
 const host=useRef();const [visible,setVisible]=useState(true);
 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
  if(host.current)observer.observe(host.current);
  const visibility=()=>setVisible(!document.hidden && !!host.current && host.current.getBoundingClientRect().bottom>0);
  document.addEventListener('visibilitychange',visibility);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);};
 },[]);
 return <div ref={host} style={{width:'100%',height:'100%',touchAction:'pan-y'}}><RenderBoundary onFailure={onFailure}>
  <Canvas dpr={[1,1.25]} camera={{position:[0,0,8],fov:42}} frameloop={visible?'always':'never'} gl={{antialias:true,alpha:true}} onCreated={({gl})=>gl.domElement.addEventListener('webglcontextlost',onFailure,{once:true})}>
   <ambientLight intensity={.3}/>
   <Environment resolution={128} frames={1}>
    <Lightformer position={[0,3,4]} scale={[8,1]} intensity={5} color="#e6f7ff"/>
    <Lightformer position={[-4,0,2]} rotation={[0,Math.PI/2,0]} scale={[2,7]} intensity={4} color="#5faaff"/>
    <Lightformer position={[4,-2,1]} rotation={[0,-Math.PI/2,0]} scale={[3,5]} intensity={3} color="#efb3a0"/>
    <Lightformer position={[0,0,-5]} scale={[8,8]} intensity={1.5} color="#426f96"/>
   </Environment>
   <Sculpture mode={mode} paused={paused} turn={turn}/>
   <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={.06} autoRotate={!paused} autoRotateSpeed={.55} minPolarAngle={.65} maxPolarAngle={2.5}/>
  </Canvas>
 </RenderBoundary></div>;
}
