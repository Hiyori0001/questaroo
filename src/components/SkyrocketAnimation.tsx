"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSparkle } from '@/contexts/SparkleContext'; // Import useSparkle

interface SkyrocketAnimationProps {
  startX: number;
  startY: number;
  onAnimationEnd: () => void;
}

const SkyrocketAnimation: React.FC<SkyrocketAnimationProps> = ({ startX, startY, onAnimationEnd }) => {
  const { triggerSparkle } = useSparkle(); // Use triggerSparkle
  const [currentX, setCurrentX] = useState(startX);
  const [currentY, setCurrentY] = useState(startY);
  const animationFrameRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);
  const animationDuration = 1500; // ms
  const peakY = startY - (window.innerHeight * 0.6); // Fly up 60% of screen height
  const peakX = startX + (Math.random() - 0.5) * 50; // Slight horizontal drift

  const animateRocket = useCallback((timestamp: DOMHighResTimeStamp) => {
    if (!animationStartTimeRef.current) {
      animationStartTimeRef.current = timestamp;
    }

    const elapsedTime = timestamp - animationStartTimeRef.current;
    const progress = Math.min(elapsedTime / animationDuration, 1);

    const interpolatedX = startX + (peakX - startX) * progress;
    const interpolatedY = startY + (peakY - startY) * progress;

    setCurrentX(interpolatedX);
    setCurrentY(interpolatedY);

    // Trigger trailing sparkles
    // Emit fewer sparkles more frequently for a trail effect
    if (progress < 1) {
      triggerSparkle(interpolatedX, interpolatedY, 1); // Emit 1 sparkle per frame
    }

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animateRocket);
    } else {
      onAnimationEnd(); // Animation finished
    }
  }, [startX, startY, peakX, peakY, animationDuration, triggerSparkle, onAnimationEnd]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateRocket);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateRocket]);

  return (
    <div
      className={cn(
        "fixed z-[9998] text-purple-500 dark:text-purple-400"
      )}
      style={{
        left: currentX,
        top: currentY,
        transform: `translate(-50%, -50%) rotate(-15deg)`, // Keep a slight rotation
      }}
    >
      <Rocket className="h-12 w-12" />
    </div>
  );
};

export default SkyrocketAnimation;