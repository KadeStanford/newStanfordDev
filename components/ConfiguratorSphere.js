import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Icosahedron,
  Dodecahedron,
  MeshPhysicalMaterial,
} from "@react-three/drei";
import { Color } from "three";

// 3D Scene Elements
function AnimatedScene({ config }) {
  const coreRef = useRef();
  const structureRef = useRef();

  useFrame((state, delta) => {
    // Constant rotation for movement
    if (coreRef.current) {
      coreRef.current.rotation.x += config.speed * delta * 0.1;
      coreRef.current.rotation.y += config.speed * delta * 0.15;

      // Subtle pulse and distortion for the "liquid" feel
      coreRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 1.5 * config.speed) * 0.04
      );
    }

    // Rotate the outer structure slowly
    if (structureRef.current) {
      structureRef.current.rotation.y += delta * 0.1;
    }
  });

  const materialColor = new Color(config.color);

  return (
    <group>
      <ambientLight intensity={0.4} />
      {/* Light source positioned high to create shadows/depth */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        color={config.color}
      />

      {/* CORE OBJECT: Changes based on config.texture (Liquid or Solid) */}
      <Icosahedron ref={coreRef} args={[1, 1]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color={materialColor}
          emissive={materialColor}
          emissiveIntensity={config.glow}
          wireframe={config.wireframe}
          transparent={true}
          opacity={config.texture === "liquid" ? 0.6 : 0.9}
          roughness={config.texture === "liquid" ? 0.1 : 0.8}
          metalness={config.texture === "liquid" ? 0.5 : 0.1}
          clearcoat={config.texture === "liquid" ? 0.5 : 0}
        />
      </Icosahedron>

      {/* OUTER STRUCTURE: Geometric cage changes based on config.wireframe */}
      <Dodecahedron
        ref={structureRef}
        args={[1.7, 0]}
        visible={config.wireframe}
      >
        <meshBasicMaterial
          color={config.wireframeColor}
          wireframe={true}
          opacity={0.3}
        />
      </Dodecahedron>
    </group>
  );
}

export const ConfiguratorSphere = ({ config }) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <Suspense fallback={null}>
          <AnimatedScene config={config} />
        </Suspense>
        {/* Controls allows user interaction to inspect the object */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={config.autoRotate}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
