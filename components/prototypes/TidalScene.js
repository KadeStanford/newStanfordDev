import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragment = `
precision highp float;
varying vec2 vUv;
uniform float uTime,uAspect,uMode;
uniform vec2 uPointer;
float surface(vec2 p){
 float t=uTime*.17;
 float r=length(p-uPointer);
 return sin(p.x*2.2+p.y*1.5+t)*.24+sin(p.x*3.1-p.y*2.2-t*.7)*.12+sin(p.y*1.2+t)*.35+sin(r*9.-uTime)*exp(-r*1.4)*.07;
}
vec3 studio(vec3 ray){
 float a=atan(ray.x,ray.z), b=ray.y;
 vec3 col=vec3(.006,.018,.04);
 col+=vec3(.10,.65,.91)*pow(max(0.,sin(a*2.1+b*2.8)),12.)*.9;
 col+=vec3(.7,.94,1.)*exp(-pow((a+b*.65-.8)*15.,2.))*1.9;
 col+=vec3(.14,.24,.8)*exp(-pow((a-b*.6+1.1)*5.,2.));
 col+=mix(vec3(.9,.3,.16),vec3(.55,.28,.85),uMode*.5)*exp(-pow((a+b*.4+2.1)*9.,2.))*1.5;
 return col;
}
void main(){
 vec2 p=(vUv-.5)*vec2(uAspect,1.)*3.4;
 float t=uTime*.17;
 float center=sin(p.y*1.3+t)*.43+sin(p.y*2.4-t)*.11;
 float width=.68+.2*cos(p.y*1.1+t*.5);
 float d=abs(p.x-center)-width;
 float mask=1.-smoothstep(-.015,.025,d);
 float h=surface(p),e=.008;
 vec2 grad=vec2(surface(p+vec2(e,0.))-h,surface(p+vec2(0.,e))-h)/e;
 float edge=pow(clamp(abs(p.x-center)/width,0.,1.),7.);
 vec3 n=normalize(vec3(-grad.x+(p.x-center)*edge*3.,-grad.y,.55-edge*.4));
 vec3 view=normalize(vec3(p*.16,1.));
 vec3 reflected=studio(reflect(-view,n));
 vec3 refraction=vec3(studio(refract(-view,n,.68)).r,studio(refract(-view,n,.70)).g,studio(refract(-view,n,.72)).b);
 float fresnel=.08+.92*pow(1.-max(dot(n,view),0.),3.);
 vec3 glass=mix(refraction*.75+vec3(.015,.075,.12),reflected,fresnel*.8+.2);
 glass+=vec3(.43,.84,1.)*exp(-abs(d)*95.)*.7;
 glass+=vec3(.18,.43,.53)*pow(.5+.5*sin((p.x-center)*19.+h*9.),28.)*.24;
 vec3 bg=vec3(.008,.023,.039)+vec3(.01,.04,.063)*exp(-dot(p,p)*.35);
 bg+=vec3(.015,.05,.09)*exp(-abs(d)*5.);
 vec3 color=mix(bg,glass,mask);
 color+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.009;
 gl_FragColor=vec4(pow(max(color,0.),vec3(.85)),1.);
}`;

function GlassSurface({activeIndex,paused}) {
 const uniforms=useMemo(()=>({uTime:{value:3},uAspect:{value:1},uMode:{value:0},uPointer:{value:new THREE.Vector2()}}),[]);
 useFrame((state,delta)=>{
  uniforms.uAspect.value=state.size.width/state.size.height;
  if(!paused) uniforms.uTime.value+=Math.min(delta,.05);
  uniforms.uMode.value=THREE.MathUtils.damp(uniforms.uMode.value,activeIndex,3,delta);
  if(!paused) uniforms.uPointer.value.lerp(state.pointer,.04);
 });
 return <mesh frustumCulled={false}><planeGeometry args={[2,2]}/><shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} depthTest={false} depthWrite={false}/></mesh>;
}

export default function TidalScene({activeIndex,paused}) {
 return <Canvas dpr={[1,1.5]} gl={{antialias:false,alpha:true,powerPreference:"low-power"}}><GlassSurface activeIndex={activeIndex} paused={paused}/></Canvas>;
}
