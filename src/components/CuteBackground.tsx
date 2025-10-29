"use client";

import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles"; // Reverted import path to directly from 'tsparticles' (correct for v3)
import type { Engine } from "tsparticles-engine";

interface CuteBackgroundProps {
  children: React.ReactNode;
}

const CuteBackground: React.FC<CuteBackgroundProps> = ({ children }) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    // console.log(container);
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent", // Background color is handled by the main app div
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: ["#FFD700", "#FF69B4", "#87CEEB", "#98FB98"], // Gold, HotPink, SkyBlue, PaleGreen
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: false, // No lines between particles
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: true,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.8,
            },
            shape: {
              type: ["circle", "star", "heart"], // Use cute shapes
              options: {
                heart: {
                  fill: true,
                },
                star: {
                  sides: 5,
                },
              },
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default CuteBackground;