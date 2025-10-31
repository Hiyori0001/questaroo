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
  shape: 'square' | 'circle' | 'star'; // Added more shapes
  type: 'star' | 'lightning' | 'explosion'; // New: type of sparkle
}

interface SparkleContextType {
  triggerSparkle: (x: number, y: number, count?: number) => void; // Modified: added count
  triggerGlobalBurst: () => void; // New: for the "boom" effect
  triggerLightning: (x: number, y: number) => void; // New: for lightning trail
}

const SparkleContext = createContext<SparkleContextType | undefined>(undefined);

export const SparkleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const { theme } = useTheme();

  const generateSparkle = useCallback((x: number, y: number, type: Sparkle['type'] = 'star'): Sparkle => {
    const baseColors = theme === 'dark'
      ? ['#FFD700', '#FFFF00', '#FFFFFF', '#FFEC8B', '#FFC125'] // Gold, Yellow, White, Light Gold, Dark Gold
      : ['#FFD700', '#FFFF00', '#FFFFFF', '#FFEC8B']; // Similar, slightly softer for light mode

    let size: number;
    let color: string;
    let animationDuration: number;
    let finalOffsetX: number;
    let finalOffsetY: number;
    let shape: Sparkle['shape'];

    switch (type) {
      case 'lightning':
        size = Math.random() * 2 + 2; // Smaller: 2-4 pixels
        color = Math.random() > 0.5 ? '#ADD8E6' : '#87CEEB'; // Light blue/sky blue
        animationDuration = Math.random() * 0.5 + 0.5; // Faster: 0.5-1s
        finalOffsetX = (Math.random() - 0.5) * 30; // Less spread
        finalOffsetY = Math.random() * 20 + 10; // Slight fall
        shape = 'square'; // Simple square for lightning
        break;
      case 'explosion':
        size = Math.random() * 5 + 5; // Larger: 5-10 pixels
        color = baseColors[Math.floor(Math.random() * baseColors.length)];
        animationDuration = Math.random() * 2 + 2; // Longer duration: 2-4s (changed from 1.5-3s)
        finalOffsetX = (Math.random() - 0.5) * 200; // Wide spread
        finalOffsetY = (Math.random() - 0.5) * 200; // Wide spread
        shape = Math.random() > 0.5 ? 'star' : 'circle'; // Stars and circles for explosion
        break;
      case 'star':
      default:
        size = Math.random() * 4 + 4; // 4-8 pixels
        color = baseColors[Math.floor(Math.random() * baseColors.length)];
        animationDuration = Math.random() * 1 + 1; // 1-2s
        finalOffsetX = (Math.random() - 0.5) * 100;
        finalOffsetY = Math.random() * 50 + 50;
        shape = Math.random() > 0.5 ? 'star' : 'circle'; // Default stars/circles
        break;
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      x: x,
      y: y,
      size: size,
      color: color,
      animationDuration: animationDuration,
      rotationStart: Math.random() * 360,
      rotationEnd: Math.random() * 720 + 360,
      finalOffsetX: finalOffsetX,
      finalOffsetY: finalOffsetY,
      shape: shape,
      type: type,
    };
  }, [theme]);

  const triggerSparkle = useCallback((x: number, y: number, count: number = 20) => { // Default count for single-point
    const newSparkles = Array.from({ length: count }).map(() =>
      generateSparkle(x, y, 'star')
    );
    setSparkles((prevSparkles) => [...prevSparkles, ...newSparkles]);
  }, [generateSparkle]);

  const triggerGlobalBurst = useCallback(() => {
    const numBursts = 10;
    const sparklesPerBurst = Math.floor(Math.random() * 20) + 30;
    const newSparkles: Sparkle[] = [];

    for (let i = 0; i < numBursts; i++) {
      const randomX = Math.random() * window.innerWidth;
      const randomY = Math.random() * window.innerHeight;
      for (let j = 0; j < sparklesPerBurst; j++) {
        newSparkles.push(generateSparkle(randomX, randomY, 'explosion')); // Use 'explosion' type
      }
    }
    setSparkles((prevSparkles) => [...prevSparkles, ...newSparkles]);
  }, [generateSparkle]);

  const triggerLightning = useCallback((x: number, y: number) => {
    const numLightning = Math.floor(Math.random() * 3) + 2; // 2-4 lightning pieces
    const newSparkles = Array.from({ length: numLightning }).map(() =>
      generateSparkle(x, y, 'lightning')
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
    <SparkleContext.Provider value={{ triggerSparkle, triggerGlobalBurst, triggerLightning }}>
      <React.Fragment>
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
                borderRadius: s.shape === 'circle' ? '50%' : '0%', // Circle or square
                clipPath: s.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none', // Star shape
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
      </React.Fragment>
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