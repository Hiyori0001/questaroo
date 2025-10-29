"use client";

import React from "react";
import { Rabbit, Squirrel, Cat, Bird } from "lucide-react"; // Changed Fox to Cat
import { cn } from "@/lib/utils";

interface CharacterProps {
  icon: React.ElementType;
  top: string;
  animationDuration: string;
  animationDelay: string;
  direction: "left-to-right" | "right-to-left";
  size?: string;
  color?: string;
}

const Character: React.FC<CharacterProps> = ({
  icon: Icon,
  top,
  animationDuration,
  animationDelay,
  direction,
  size = "h-8 w-8",
  color = "text-gray-500 dark:text-gray-400",
}) => {
  return (
    <div
      className={cn(
        "absolute z-10", // Ensure it's above particles but below main content
        color,
        size,
        direction === "left-to-right" ? "animate-run-left-to-right" : "animate-run-right-to-left"
      )}
      style={{
        top,
        animationDuration,
        animationDelay,
      }}
    >
      <Icon className="h-full w-full" />
    </div>
  );
};

const RunningCharactersBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Character icon={Rabbit} top="15%" animationDuration="25s" animationDelay="0s" direction="left-to-right" size="h-10 w-10" color="text-pink-500 dark:text-pink-400" />
      <Character icon={Squirrel} top="30%" animationDuration="30s" animationDelay="5s" direction="right-to-left" size="h-9 w-9" color="text-orange-500 dark:text-orange-400" />
      <Character icon={Cat} top="50%" animationDuration="20s" animationDelay="10s" direction="left-to-right" size="h-12 w-12" color="text-red-500 dark:text-red-400" />
      <Character icon={Bird} top="70%" animationDuration="35s" animationDelay="15s" direction="right-to-left" size="h-8 w-8" color="text-blue-500 dark:text-blue-400" />
      <Character icon={Rabbit} top="85%" animationDuration="28s" animationDelay="20s" direction="left-to-right" size="h-10 w-10" color="text-purple-500 dark:text-purple-400" />
    </div>
  );
};

export default RunningCharactersBackground;