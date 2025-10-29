"use client";

import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  animationData: any; // The imported Lottie JSON data
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onComplete?: () => void;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  style,
  className,
  onComplete,
}) => {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (lottieRef.current && onComplete) {
      lottieRef.current.addEventListener('complete', onComplete);
      return () => {
        lottieRef.current?.removeEventListener('complete', onComplete);
      };
    }
  }, [onComplete]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={style}
      className={className}
    />
  );
};

export default LottieAnimation;