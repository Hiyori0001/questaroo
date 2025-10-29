"use client";

import React, { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import { useTheme } from "next-themes";

const CuteBackground: React.FC = () => {
  const { theme } = useTheme();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    // console.log(container);
  }, []);

  const particleColors = useMemo(() => {
    if (theme === 'dark') {
      return ["#FFD700", "#FF69B4", "#87CEEB", "#98FB98", "#FFFFFF", "#FFA07A"];
    } else {
      return ["#FFD700", "#FF69B4", "#87CEEB", "#98FB98", "#ADD8E6", "#F08080"];
    }
  }, [theme]);

  return (
    <div className="fixed inset-0 z-0"> {/* Fixed and z-0 to cover the entire viewport behind everything */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent",
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
                mode: "push", // Changed from "repulse" to "push" for gushing effect
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 5, // Reduced quantity for better performance
              },
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: particleColors,
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: false,
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
              value: 80, // Base number of particles
            },
            opacity: {
              value: 0.8,
            },
            shape: {
              type: ["circle", "star", "heart"],
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
            life: { // Added life to make pushed particles fade out
              count: 1,
              duration: {
                min: 0.5,
                max: 1.5,
              },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
};

export default CuteBackground;