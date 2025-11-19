import React, { useEffect, useState } from "react";
import { clsx } from "clsx";

export const Meteors = ({ number = 20, className }) => {
  const [meteors, setMeteors] = useState([]);

  useEffect(() => {
    const styles = new Array(number).fill(true).map(() => ({
      left: Math.floor(Math.random() * 100) + "%",
      top: -Math.floor(Math.random() * 100) + "px", // Start slightly above
      animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
    }));
    setMeteors(styles);
  }, [number]);

  return (
    <>
      {meteors.map((style, idx) => (
        <span
          key={idx}
          className={clsx(
            // Base styles
            "pointer-events-none absolute size-0.5 rotate-[215deg] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            // Animation
            "animate-meteor",
            // Tail
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={style}
        />
      ))}
    </>
  );
};
