import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

// Generate random points inside a sphere
function generateStars(count = 5000, radius = 1.5) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius; // Radius
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

function StarField({ count, size, radius = 1.5 }) {
  const ref = useRef();
  const [sphere] = useState(() => generateStars(count, radius));

  useFrame((state, delta) => {
    // Rotate the starfield
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#fff"
          size={size}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function StarBackground() {
  return (
    <div className="w-full h-auto fixed inset-0 z-[0] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          {/* Layer 1: Deep Dust (Tiny, high count) */}
          <StarField count={5000} size={0.0015} />

          {/* Layer 2: Standard Stars (Medium) */}
          <StarField count={2000} size={0.003} />

          {/* Layer 3: Bright Stars (Large, low count) */}
          <StarField count={300} size={0.006} />

          {/* Layer 4: Major Stars (Extra Large, very low count) */}
          <StarField count={50} size={0.01} />
        </Suspense>
      </Canvas>
    </div>
  );
}
