"use client";

import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { useTheme } from "next-themes";

interface Sparkle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  animationDuration: number;
  rotationStart: number;
  rotationEnd: number;
  finalOffsetX: number;
  finalOffsetY: number;
  shape: 'square'; // For a glittery, diamond-like effect when rotated
}

const GlobalSparkleClickEffect: React.FC = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const { theme } = useTheme();

  const generateSparkle = useCallback((x: number, y: number): Sparkle => {
    // Golden, yellow, and white colors for a glittery effect
    const colors = theme === 'dark'
      ? ['#FFD700', '#FFFF00', '#FFFFFF', '#FFEC8B', '#FFC125'] // Gold, Yellow, White, Light Gold, Dark Gold
      : ['#FFD700', '#FFFF00', '#FFFFFF', '#FFEC8B']; // Similar, slightly softer for light mode

    return {
      id: Math.random().toString(36).substring(2, 9),
      x: x,
      y: y,
      size: Math.random() * 2 + 2, // Smaller size between 2 and 4 pixels
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: Math.random() * 0.7 + 0.8, // Longer duration between 0.8s and 1.5s (from confetti)
      rotationStart: Math.random() * 360,
      rotationEnd: Math.random() * 720 + 360, // Rotate more for a dynamic fall (from confetti)
      finalOffsetX: (Math.random() - 0.5) * 300, // Spread horizontally -150 to 150 pixels (from confetti)
      finalOffsetY: Math.random() * 200 + 100, // Fall downwards 100 to 300 pixels (from confetti)
      shape: 'square', // Force square shape for glitter
    };
  }, [theme]);

  const addSparkle = useCallback((event: MouseEvent) => {
    const numSparkles = Math.floor(Math.random() * 10) + 10; // 10 to 19 sparkles per click for a denser burst (from confetti)
    const newSparkles = Array.from({ length: numSparkles }).map(() =>
      generateSparkle(event.clientX, event.clientY)
    );
    setSparkles((prevSparkles) => [...prevSparkles, ...newSparkles]);
  }, [generateSparkle]);

  const removeSparkle = useCallback((id: string) => {
    setSparkles((prevSparkles) => prevSparkles.filter((s) => s.id !== id));
  }, []);

  // Attach global click listener
  useEffect(() => {
    document.body.addEventListener('click', addSparkle);
    return () => {
      document.body.removeEventListener('click', addSparkle);
    };
  }, [addSparkle]);

  // Clean up sparkles after their animation
  useLayoutEffect(() => {
    sparkles.forEach((sparkle) => {
      const timeout = setTimeout(() => removeSparkle(sparkle.id), sparkle.animationDuration * 1000);
      return () => clearTimeout(timeout);
    });
  }, [sparkles, removeSparkle]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]"> {/* Ensure sparkles are on top */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            // Custom CSS properties for animation values
            '--sparkle-final-offset-x': `${s.finalOffsetX}px`,
            '--sparkle-final-offset-y': `${s.finalOffsetY}px`,
            '--sparkle-rotation-start': `${s.rotationStart}deg`,
            '--sparkle-rotation-end': `${s.rotationEnd}deg`,
            animation: `confetti-fall ${s.animationDuration}s ease-out forwards`,
            filter: 'blur(0.2px)', // Slight blur for a softer, glittery look
            boxShadow: `0 0 ${s.size / 2}px ${s.color}`, // Subtle glow for glitter
            borderRadius: '0%', // Explicitly square for glitter
            transform: `translate(-50%, -50%) rotate(${s.rotationStart}deg)`, // Initial transform to center and rotate
          } as React.CSSProperties} // Type assertion for custom CSS properties
        />
      ))}
      <style jsx="true">{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.8) rotate(var(--sparkle-rotation-start));
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--sparkle-final-offset-x)), calc(-50% + var(--sparkle-final-offset-y))) scale(0) rotate(var(--sparkle-rotation-end));
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalSparkleClickEffect;