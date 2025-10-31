"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSparkle } from '@/contexts/SparkleContext';
import SkyrocketAnimation from './SkyrocketAnimation';

const InteractiveAnimations: React.FC = () => {
  const { triggerSparkle, triggerLightning } = useSparkle(); // Removed triggerGlobalBurst
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [rocketAnimation, setRocketAnimation] = useState<{ x: number; y: number } | null>(null);
  // Removed lastSparkleTimeRef, lastLightningTimeRef, sparkleThrottle, lightningThrottle as they are no longer needed for drag animation.

  const handleMouseMove = useCallback((event: MouseEvent) => {
    // Removed logic for triggering sparkles and lightning on mouse move while dragging.
    // The drag animation is now completely removed.
  }, []); // Dependencies are now empty as no state/props are used inside

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsMouseDown(true);
      setRocketAnimation(null); // Clear any pending rocket
    }
  }, []);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (event.button === 0 && isMouseDown) { // Left mouse button released after being down
      setIsMouseDown(false);
      setRocketAnimation({ x: event.clientX, y: event.clientY });
    }
  }, [isMouseDown]);

  // Removed handleRocketBoom as it's no longer used.

  const handleRocketAnimationEnd = useCallback(() => {
    setRocketAnimation(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp]);

  return (
    <>
      {rocketAnimation && (
        <SkyrocketAnimation
          startX={rocketAnimation.x}
          startY={rocketAnimation.y}
          onAnimationEnd={handleRocketAnimationEnd}
        />
      )}
    </>
  );
};

export default InteractiveAnimations;