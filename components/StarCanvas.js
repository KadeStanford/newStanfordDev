import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

// Generate random points inside a sphere.
function generateStars(count = 5000, radius = 1.5) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return positions;
}

function StarField({ count, size, radius = 1.5 }) {
  const ref = useRef();
  const [sphere] = useState(() => generateStars(count, radius));

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 30;
      ref.current.rotation.y -= delta / 45;
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

export default function StarCanvas() {
  return (
    <div className="fixed inset-0 z-[0] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <StarField count={5000} size={0.0015} />
          <StarField count={2000} size={0.003} />
          <StarField count={300} size={0.006} />
          <StarField count={50} size={0.01} />
        </Suspense>
      </Canvas>
    </div>
  );
}
