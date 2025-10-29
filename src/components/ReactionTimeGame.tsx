"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Timer, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type GameState = "idle" | "waiting" | "ready" | "playing";

const ReactionTimeGame = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const savedBestScore = localStorage.getItem("reactionTimeBestScore");
      return savedBestScore ? parseFloat(savedBestScore) : null;
    }
    return null;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && bestScore !== null) {
      localStorage.setItem("reactionTimeBestScore", bestScore.toString());
    }
  }, [bestScore]);

  const startGame = useCallback(() => {
    setGameState("waiting");
    setReactionTime(null);
    // Removed: toast.info("Get ready! Click when the box turns green.");

    const randomDelay = Math.random() * 3000 + 2000; // 2 to 5 seconds
    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      startTimeRef.current = performance.now();
    }, randomDelay);
  }, []);

  const handleClick = () => {
    if (gameState === "idle") {
      startGame();
    } else if (gameState === "waiting") {
      // Clicked too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState("idle");
      toast.error("Too early! You clicked before it turned green.");
    } else if (gameState === "ready") {
      // Correct click
      const endTime = performance.now();
      const timeTaken = parseFloat((endTime - startTimeRef.current).toFixed(2));
      setReactionTime(timeTaken);
      setGameState("playing"); // Indicate game is over for this round

      if (bestScore === null || timeTaken < bestScore) {
        setBestScore(timeTaken);
        toast.success(`New best score: ${timeTaken} ms!`);
      } else {
        toast.success(`Your reaction time: ${timeTaken} ms.`);
      }
    } else if (gameState === "playing") {
      // Game is over, allow restart
      resetGame();
    }
  };

  const resetGame = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGameState("idle");
    setReactionTime(null);
    startTimeRef.current = 0;
    toast.info("Reaction Time Challenge reset.");
  }, []);

  const getButtonClasses = () => {
    switch (gameState) {
      case "idle":
        return "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600";
      case "waiting":
        return "bg-red-500 cursor-not-allowed";
      case "ready":
        return "bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600";
      case "playing":
        return "bg-gray-400 dark:bg-gray-600 cursor-pointer";
      default:
        return "";
    }
  };

  const getButtonText = () => {
    switch (gameState) {
      case "idle":
        return "Start Challenge";
      case "waiting":
        return "Wait for Green...";
      case "ready":
        return "Click Now!";
      case "playing":
        return "Play Again?";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
      <CardHeader>
        <Zap className="h-16 w-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
          Reaction Time Challenge
        </CardTitle>
        <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
          Click the button as soon as it turns green!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
          <p className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Current: {reactionTime !== null ? `${reactionTime} ms` : "--"}
          </p>
          <p className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500 dark:text-yellow-400" /> Best: {bestScore !== null ? `${bestScore} ms` : "--"}
          </p>
        </div>

        <Button
          onClick={handleClick}
          className={cn(
            "w-full h-32 text-3xl font-bold transition-colors duration-100 ease-out active:scale-95",
            getButtonClasses()
          )}
          disabled={gameState === "waiting"}
        >
          {getButtonText()}
        </Button>

        {reactionTime !== null && gameState === "playing" && (
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            Your reaction time: {reactionTime} ms!
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center mt-6">
        {(gameState === "playing" || gameState === "waiting") && (
          <Button onClick={resetGame} variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
            <RefreshCw className="h-4 w-4 mr-2" /> Reset Game
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReactionTimeGame;