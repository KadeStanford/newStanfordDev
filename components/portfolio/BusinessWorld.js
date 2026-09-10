import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Line } from '@react-three/drei';
import gsap from 'gsap';
function Block({position,size,color='#263b36'}){return <RoundedBox args={size} radius={.08} smoothness={3} position={position}><meshStandardMaterial color={color} roughness={.38} metalness={.35}/></RoundedBox>;}
function Scene({view,phase,paused}){
 const {camera,invalidate,size}=useThree();const parcel=useRef();
 useEffect(()=>{camera.fov=size.width>800?34:45;camera.updateProjectionMatrix();invalidate();},[camera,size.width,invalidate]);
 useEffect(()=>{const tween=gsap.to(camera.position,{x:(view-1)*3,y:6,z:11,duration:paused?0:1.2,ease:'power3.inOut',onUpdate:()=>{camera.lookAt(0,0,0);invalidate();}});return()=>tween.kill();},[view,paused,camera,invalidate]);
 useFrame(({clock})=>{if(parcel.current)parcel.current.position.y=.8+(paused?0:Math.sin(clock.elapsedTime*2)*.12);});
 return <><ambientLight intensity={1.1}/><directionalLight position={[4,8,5]} intensity={3}/><pointLight position={[-4,3,2]} color="#c8f06b" intensity={14}/><Block position={[0,-.65,0]} size={[13,.25,5]} color="#142320"/>
 <Line points={[[-4,-.48,1.5],[0,-.48,1.5],[4,-.48,1.5]]} color={phase?'#c8f06b':'#486257'} lineWidth={3}/>
 <group position={[-4,0,0]} rotation={[-.15,0,-.1]}><Block position={[0,1,0]} size={[1.6,3,.22]} color="#4b6153"/><Block position={[0,1,.15]} size={[1.4,2.75,.08]} color="#091513"/>{[0,1,2].map(i=><Block key={i} position={[0,1.5-i*.45,.22]} size={[1.05,.2,.05]} color={i===2&&phase>0?'#c8f06b':'#49665a'}/>)}<Block position={[0,.05,.22]} size={[.8,.25,.05]} color="#c8f06b"/></group>
 <group><Block position={[0,.2,-.5]} size={[3.1,1.5,2]}/><Block position={[0,1.05,-.5]} size={[3.5,.25,2.3]} color="#c8f06b"/>{[-1,0,1].map(x=><Block key={x} position={[x,.35,.54]} size={[.65,1,.08]} color="#0b1714"/>)}<Block position={[0,1.6,-.6]} size={[2,.65,.18]} color="#52664e"/><Block position={[0,1.6,-.48]} size={[1.5,.1,.04]} color="#c8f06b"/></group>
 <group position={[4,0,0]} rotation={[-.22,-.15,0]}><Block position={[0,.9,0]} size={[2.4,2.6,.2]} color="#4b6153"/><Block position={[0,1.85,.15]} size={[2.1,.35,.08]} color="#c8f06b"/>{Array.from({length:9},(_,i)=><Block key={i} position={[-.65+(i%3)*.65,1.25-Math.floor(i/3)*.55,.15]} size={[.48,.4,.08]} color={phase>=3&&i===4?'#c8f06b':'#1c3028'}/>)}</group>
 {phase>0&&<group ref={parcel} position={[phase===1?-2:phase===2?0:2,.8,1.5]}><Block position={[0,0,0]} size={[.65,.85,.08]} color="#e1edcd"/></group>}</>;
}
export default function BusinessWorld(props){return <Canvas dpr={[1,1.5]} frameloop={props.paused?'demand':'always'} camera={{position:[0,6,11],fov:45}}><Scene {...props}/></Canvas>;}
