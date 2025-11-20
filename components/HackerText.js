import React, { useState, useEffect, useRef } from "react";

const CHARS = "-_~`!@#$%^&*()+=[]{}|;:,.<>?/ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function HackerText({ text, className = "" }) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef(null);

  // Scramble logic is defined inline in the effect to avoid stale closure / lint warnings
  useEffect(() => {
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(intervalRef.current);
  }, [text]);

  return (
    <span
      className={`font-mono cursor-default ${className}`}
      onMouseEnter={scramble} // Re-scramble on hover for fun
    >
      {displayText}
    </span>
  );
}
