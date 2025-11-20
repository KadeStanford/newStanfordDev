import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { motion } from "framer-motion";

export default function GlobeSection() {
  const canvasRef = useRef();
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const phi = useRef(0);
  const widthRef = useRef(0);

  // Velocity state for inertia
  const r = useRef(0);

  useEffect(() => {
    const onResize = () =>
      canvasRef.current && (widthRef.current = canvasRef.current.offsetWidth);
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.2],
      markerColor: [0.5, 0.2, 0.9],
      glowColor: [0.2, 0.2, 0.5],
      markers: [
        { location: [30.9843, -91.9623], size: 0.1 }, // Louisiana
      ],
      onRender: (state) => {
        // 1. If dragging: Calculate velocity based on drag speed
        if (pointerInteracting.current !== null) {
          const dragAmount = pointerInteractionMovement.current;
          r.current = dragAmount * 0.005;
        }
        // 2. If released: Apply inertia (decay velocity)
        else {
          // Friction factor (0.95 means it loses 5% speed per frame)
          r.current *= 0.95;

          // If velocity is very low, settle into a slow idle spin
          if (Math.abs(r.current) < 0.001) {
            r.current = 0.001;
          }
        }

        // Apply velocity to rotation
        phi.current += r.current;

        state.phi = phi.current;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="pb-20 pt-0 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        {/* Layout: 12 Columns. Text takes 5, Globe takes 7. Gap is small (4). */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Text Content */}
          <div className="lg:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Ready for a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Global Scale
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400 leading-relaxed"
            >
              We build with the future in mind. Whether you&apos;re starting
              local or planning to conquer markets abroad, our infrastructure is
              engineered to scale seamlessly with your ambition.
            </motion.p>
          </div>

          {/* Globe Canvas */}
          <div className="lg:col-span-7 relative h-[400px] w-full md:h-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing">
            {/* Removed blocking gradient to reveal stars */}
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                pointerInteracting.current = e.clientX;
                pointerInteractionMovement.current = 0;
                canvasRef.current.style.cursor = "grabbing";
              }}
              onPointerUp={() => {
                pointerInteracting.current = null;
                canvasRef.current.style.cursor = "grab";
              }}
              onPointerOut={() => {
                pointerInteracting.current = null;
                canvasRef.current.style.cursor = "grab";
              }}
              onMouseMove={(e) => {
                if (pointerInteracting.current !== null) {
                  const delta = e.clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta;
                  // Reset the reference point so 'delta' is per-frame velocity
                  pointerInteracting.current = e.clientX;
                }
              }}
              onTouchMove={(e) => {
                if (pointerInteracting.current !== null && e.touches[0]) {
                  const delta =
                    e.touches[0].clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta;
                  pointerInteracting.current = e.touches[0].clientX;
                }
              }}
              onTouchStart={(e) => {
                pointerInteracting.current = e.touches[0].clientX;
                pointerInteractionMovement.current = 0;
              }}
              onTouchEnd={() => {
                pointerInteracting.current = null;
              }}
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "600px",
                aspectRatio: "1",
                opacity: 0,
                transition: "opacity 1s ease",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
