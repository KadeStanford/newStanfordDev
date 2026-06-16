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
  const [useCanvas, setUseCanvas] = useState(false);

  useEffect(() => {
    const canUseCanvas =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canUseCanvas) return undefined;

    setUseCanvas(true);

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

  if (!useCanvas) {
    return (
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute inset-0 mobile-network" />
        <div className="absolute inset-0 mobile-network-pulse" />

        <style jsx>{`
          .mobile-network,
          .mobile-network-pulse {
            mask-image: linear-gradient(
              to bottom,
              transparent,
              black 22%,
              black 78%,
              transparent
            );
          }

          .mobile-network {
            background-image:
              radial-gradient(circle at 18% 24%, rgba(96, 165, 250, 0.26), transparent 24%),
              radial-gradient(circle at 82% 32%, rgba(168, 85, 247, 0.22), transparent 27%),
              linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
            background-size: 100% 100%, 100% 100%, 32px 32px, 32px 32px;
            animation: network-drift 42s linear infinite;
          }

          .mobile-network-pulse {
            background-image:
              radial-gradient(circle at 28% 34%, rgba(255, 255, 255, 0.34) 0 2px, transparent 3px),
              radial-gradient(circle at 62% 24%, rgba(96, 165, 250, 0.46) 0 2px, transparent 3px),
              radial-gradient(circle at 72% 68%, rgba(167, 139, 250, 0.42) 0 2px, transparent 3px),
              linear-gradient(135deg, transparent 0 46%, rgba(167, 139, 250, 0.18) 47% 48%, transparent 49%),
              linear-gradient(35deg, transparent 0 50%, rgba(96, 165, 250, 0.16) 51% 52%, transparent 53%);
            background-size: 220px 220px, 260px 260px, 300px 300px, 180px 180px, 240px 240px;
            animation: network-pulse 7s ease-in-out infinite;
          }

          @keyframes network-drift {
            to {
              transform: translate3d(-32px, 32px, 0);
            }
          }

          @keyframes network-pulse {
            0%,
            100% {
              opacity: 0.48;
              transform: scale(1);
            }
            50% {
              opacity: 0.82;
              transform: scale(1.03);
            }
          }
        `}</style>
      </div>
    );
  }

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
