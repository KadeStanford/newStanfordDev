import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import ForceGraph2D to avoid SSR issues with Canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function NetworkBackground() {
  const containerRef = useRef(null);
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [data, setData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // 1. Measure the container to size the canvas correctly
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    // 2. Generate random network data
    const N = 35; // Number of nodes
    const nodes = [...Array(N).keys()].map((i) => ({ id: i }));
    const links = [];

    // Create a more organic web structure
    nodes.forEach((node) => {
      const numNeighbors = Math.floor(Math.random() * 2) + 1; // 1-2 connections per node
      for (let i = 0; i < numNeighbors; i++) {
        const target = Math.floor(Math.random() * N);
        if (target !== node.id) {
          links.push({ source: node.id, target });
        }
      }
    });

    setData({ nodes, links });
    updateDimensions();

    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-40 mask-gradient overflow-hidden"
      style={{
        // Fade out at the edges
        maskImage:
          "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
        // GLOW EFFECT
        filter:
          "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6)) drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))",
      }}
    >
      {/* Rotating Wrapper */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center"
        style={{ animation: "spin-slow 120s linear infinite" }}
      >
        {dimensions.width > 0 && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            // Physics settings for Constant Morphing
            // AlphaDecay 0 means it never "cools down" or stops calculating
            d3AlphaDecay={0}
            d3VelocityDecay={0.05} // Low friction allows continuous drifting
            // Infinite Simulation
            cooldownTicks={Infinity}
            cooldownTime={Infinity}
            // Colors & Styling
            backgroundColor="transparent"
            linkColor={() => "#a78bfa"} // Purple lines
            linkWidth={2} // Thicker lines for "Bigger" look
            // Custom Node Rendering for Extra Glow and Size
            nodeCanvasObject={(node, ctx) => {
              const size = 6; // Bigger nodes
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
              ctx.fillStyle = "#60a5fa"; // Blue nodes
              ctx.shadowColor = "#60a5fa";
              ctx.shadowBlur = 20; // Strong glow
              ctx.fill();
            }}
            // Controls
            enableNodeDrag={false}
            enableZoom={false}
            enablePan={false}
            // Particles (Data Flow)
            linkDirectionalParticles={4} // More particles
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleWidth={3}
            linkDirectionalParticleColor={() => "#ffffff"}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: scale(1.5) rotate(0deg);
          }
          100% {
            transform: scale(1.5) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
