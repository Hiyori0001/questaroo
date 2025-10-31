"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkyrocketAnimationProps {
  startX: number;
  startY: number;
  onBoom: (x: number, y: number) => void;
  onAnimationEnd: () => void; // Callback to notify parent to remove this component
}

const SkyrocketAnimation: React.FC<SkyrocketAnimationProps> = ({ startX, startY, onBoom, onAnimationEnd }) => {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [phase, setPhase] = useState<'launch' | 'boom' | 'done'>('launch');
  const rocketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'launch') {
      // Animate rocket upwards
      const animationDuration = 1500; // ms
      const peakY = startY - (window.innerHeight * 0.6); // Fly up 60% of screen height
      const peakX = startX + (Math.random() - 0.5) * 50; // Slight horizontal drift

      if (rocketRef.current) {
        const animation = rocketRef.current.animate(
          [
            { transform: `translate(-50%, -50%) translate(${startX}px, ${startY}px) rotate(0deg)`, opacity: 1 },
            { transform: `translate(-50%, -50%) translate(${peakX}px, ${peakY}px) rotate(-15deg)`, opacity: 1 },
          ],
          {
            duration: animationDuration,
            easing: 'ease-out',
            fill: 'forwards',
          }
        );
        animation.onfinish = () => {
          setPosition({ x: peakX, y: peakY });
          setPhase('boom');
        };
      }
    } else if (phase === 'boom') {
      onBoom(position.x, position.y); // Trigger global burst at rocket's peak
      setPhase('done');
      // Rocket disappears instantly after boom
      onAnimationEnd();
    }
  }, [phase, startX, startY, position.x, position.y, onBoom, onAnimationEnd]);

  if (phase === 'done') {
    return null;
  }

  return (
    <div
      ref={rocketRef}
      className={cn(
        "fixed z-[9998] text-purple-500 dark:text-purple-400"
        // Removed "transition-opacity duration-100" to ensure instant disappearance
      )}
      style={{
        left: 0, // Positioned by transform
        top: 0,
        transform: `translate(-50%, -50%) translate(${startX}px, ${startY}px)`,
        // Removed initial opacity: 0, relying on animation keyframes for visibility
      }}
    >
      <Rocket className="h-12 w-12" />
    </div>
  );
};

export default SkyrocketAnimation;