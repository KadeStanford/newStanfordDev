import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function GlassRibbon({ offset, color, speed, active, onActivate }) {
  const mesh = useRef(null);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.2, -1.5 + offset, 0),
        new THREE.Vector3(-1.4, 1.4 + offset * 0.35, 0.6),
        new THREE.Vector3(0.3, -0.5 + offset * 0.2, -0.2),
        new THREE.Vector3(1.8, 1.2 - offset * 0.25, 0.4),
        new THREE.Vector3(3.4, -0.8 + offset, 0),
      ]),
    [offset]
  );

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.z =
      Math.sin(state.clock.elapsedTime * speed + offset) * 0.08;
    mesh.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.22 + offset) * 0.14;
  });

  return (
    <mesh
      ref={mesh}
      onPointerEnter={onActivate}
      onFocus={onActivate}
      scale={active ? 1.06 : 1}
    >
      <tubeGeometry args={[curve, 128, active ? 0.25 : 0.18, 20, false]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.12}
        metalness={0.08}
        transmission={0.82}
        thickness={1.25}
        transparent
        opacity={active ? 0.92 : 0.58}
      />
    </mesh>
  );
}

export default function TidalScene({ activeIndex, onActivate }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 44 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.4} />
      <pointLight position={[-4, 3, 4]} color="#93ecff" intensity={30} />
      <pointLight position={[4, -2, 2]} color="#ff9b8f" intensity={22} />
      <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.35}>
        <group rotation={[0.08, -0.18, -0.1]}>
          <GlassRibbon
            offset={1.05}
            color="#8ee9ff"
            speed={0.38}
            active={activeIndex === 0}
            onActivate={() => onActivate(0)}
          />
          <GlassRibbon
            offset={0}
            color="#8877ff"
            speed={0.31}
            active={activeIndex === 1}
            onActivate={() => onActivate(1)}
          />
          <GlassRibbon
            offset={-1.05}
            color="#ff9b8f"
            speed={0.26}
            active={activeIndex === 2}
            onActivate={() => onActivate(2)}
          />
        </group>
      </Float>
    </Canvas>
  );
}
