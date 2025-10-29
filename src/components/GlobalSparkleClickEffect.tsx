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
}

const GlobalSparkleClickEffect: React.FC = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const { theme } = useTheme();

  const generateSparkle = useCallback((x: number, y: number): Sparkle => {
    // More golden/yellow/white colors for click sparkles
    const colors = theme === 'dark'
      ? ['#FFD700', '#FFFF00', '#FFFFFF', '#FFEC8B', '#FFC125'] // Gold, Yellow, White, Light Gold, Dark Gold
      : ['#FFD700', '#FFFF00', '#FFFFFF', '#FFEC8B']; // Similar, slightly softer for light mode

    return {
      id: Math.random().toString(36).substring(2, 9),
      x: x + (Math.random() - 0.5) * 10, // Slight random offset
      y: y + (Math.random() - 0.5) * 10,
      size: Math.random() * 3 + 3, // Smaller size between 3 and 6
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: Math.random() * 0.4 + 0.4, // Shorter duration between 0.4s and 0.8s
    };
  }, [theme]);

  const addSparkle = useCallback((event: MouseEvent) => {
    // Create multiple sparkles for a "burst" effect
    const numSparkles = Math.floor(Math.random() * 3) + 3; // 3 to 5 sparkles per click
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
          className="absolute rounded-full"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            opacity: 0, // Start invisible
            transform: 'translate(-50%, -50%) scale(0)', // Start small
            animation: `sparkle-fade-out ${s.animationDuration}s ease-out forwards`,
            filter: 'blur(0.5px)', // Slightly less blur for a sharper sparkle
            boxShadow: `0 0 ${s.size / 2}px ${s.color}`, // Add a glow effect
          }}
        />
      ))}
      <style jsx="true">{`
        @keyframes sparkle-fade-out {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) translateY(-15px); /* Float up slightly */
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalSparkleClickEffect;