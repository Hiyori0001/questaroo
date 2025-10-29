"use client";

import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';

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
    const colors = theme === 'dark'
      ? ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FFFFFF'] // Brighter for dark mode
      : ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98']; // Softer for light mode

    return {
      id: Math.random().toString(36).substring(2, 9),
      x: x + (Math.random() - 0.5) * 10, // Slight random offset
      y: y + (Math.random() - 0.5) * 10,
      size: Math.random() * 5 + 5, // Size between 5 and 10
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: Math.random() * 0.5 + 0.5, // Duration between 0.5s and 1s
    };
  }, [theme]);

  const addSparkle = useCallback((event: MouseEvent) => {
    setSparkles((prevSparkles) => [...prevSparkles, generateSparkle(event.clientX, event.clientY)]);
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
            filter: 'blur(1px)', // Soften the sparkle
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
            transform: translate(-50%, -50%) scale(0) translateY(-20px); /* Float up slightly */
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalSparkleClickEffect;