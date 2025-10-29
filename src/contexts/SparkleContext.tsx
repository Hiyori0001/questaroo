"use client";

import React, { createContext, useContext, useState, useCallback, useLayoutEffect } from 'react';
import { useTheme } from 'next-themes';

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
  shape: 'square';
}

interface SparkleContextType {
  triggerSparkle: (x: number, y: number) => void;
}

const SparkleContext = createContext<SparkleContextType | undefined>(undefined);

export const SparkleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const { theme } = useTheme();

  const generateSparkle = useCallback((x: number, y: number): Sparkle => {
    const colors = theme === 'dark'
      ? ['#FFD700', '#FFFF00', '#FFFFFF', '#FFEC8B', '#FFC125'] // Gold, Yellow, White, Light Gold, Dark Gold
      : ['#FFD700', '#FFFF00', '#FFFFFF', '#FFEC8B']; // Similar, slightly softer for light mode

    return {
      id: Math.random().toString(36).substring(2, 9),
      x: x,
      y: y,
      size: Math.random() * 2 + 2, // Smaller size between 2 and 4 pixels
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: Math.random() * 0.5 + 0.5, // Shorter duration between 0.5s and 1s
      rotationStart: Math.random() * 360,
      rotationEnd: Math.random() * 720 + 360,
      finalOffsetX: (Math.random() - 0.5) * 50, // Reduced spread horizontally -25 to 25 pixels
      finalOffsetY: Math.random() * 30 + 20, // Reduced fall downwards 20 to 50 pixels
      shape: 'square',
    };
  }, [theme]);

  const triggerSparkle = useCallback((x: number, y: number) => {
    const numSparkles = Math.floor(Math.random() * 13) + 14; // Doubled to 14-26 sparkles per trigger
    const newSparkles = Array.from({ length: numSparkles }).map(() =>
      generateSparkle(x, y)
    );
    setSparkles((prevSparkles) => [...prevSparkles, ...newSparkles]);
  }, [generateSparkle]);

  // Clean up sparkles after their animation
  useLayoutEffect(() => {
    sparkles.forEach((sparkle) => {
      const timeout = setTimeout(() => {
        setSparkles((prevSparkles) => prevSparkles.filter((s) => s.id !== sparkle.id));
      }, sparkle.animationDuration * 1000);
      return () => clearTimeout(timeout);
    });
  }, [sparkles]);

  return (
    <SparkleContext.Provider value={{ triggerSparkle }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
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
              '--sparkle-final-offset-x': `${s.finalOffsetX}px`,
              '--sparkle-final-offset-y': `${s.finalOffsetY}px`,
              '--sparkle-rotation-start': `${s.rotationStart}deg`,
              '--sparkle-rotation-end': `${s.rotationEnd}deg`,
              animation: `confetti-fall ${s.animationDuration}s ease-out forwards`,
              filter: 'blur(0.2px)',
              boxShadow: `0 0 ${s.size / 2}px ${s.color}`,
              borderRadius: '0%',
              transform: `translate(-50%, -50%) rotate(${s.rotationStart}deg)`,
            } as React.CSSProperties}
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
    </SparkleContext.Provider>
  );
};

export const useSparkle = () => {
  const context = useContext(SparkleContext);
  if (context === undefined) {
    throw new Error("useSparkle must be used within a SparkleProvider");
  }
  return context;
};