"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MousePointerClick, RefreshCw, Timer } from "lucide-react";
import { toast } from "sonner";

const GAME_DURATION_SECONDS = 10; // 10 seconds for the game

const ClickerChallengeGame = () => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setIsRunning(true);
    setGameOver(false);
    toast.info("Clicker Challenge started! Click as fast as you can!");
  };

  const resetGame = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setClicks(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setIsRunning(false);
    setGameOver(false);
    toast.info("Clicker Challenge reset.");
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setGameOver(true);
      // The 'clicks' value here will be the final value when the timer hits 0
      toast.success(`Time's up! You clicked ${clicks} times!`);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]); // Removed 'clicks' from dependency array

  const handleClick = () => {
    if (isRunning) {
      setClicks((prevClicks) => prevClicks + 1);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
      <CardHeader>
        <MousePointerClick className="h-16 w-16 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Clicker Challenge
        </CardTitle>
        <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
          Click the button as many times as you can in {GAME_DURATION_SECONDS} seconds!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around items-center text-2xl font-semibold text-gray-800 dark:text-gray-200">
          <p className="flex items-center gap-2">
            <MousePointerClick className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Clicks: {clicks}
          </p>
          <p className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-red-600 dark:text-red-400" /> Time: {timeLeft}s
          </p>
        </div>

        <Button
          onClick={handleClick}
          disabled={!isRunning || gameOver}
          className="w-full h-24 text-3xl font-bold bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-all duration-100 ease-out active:scale-95"
        >
          {isRunning ? "Click Me!" : gameOver ? "Game Over!" : "Start Game"}
        </Button>

        {gameOver && (
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            Final Score: {clicks} clicks!
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4 mt-6">
        {!isRunning && !gameOver && (
          <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            <MousePointerClick className="h-4 w-4 mr-2" /> Start Challenge
          </Button>
        )}
        {(isRunning || gameOver) && (
          <Button onClick={resetGame} variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClickerChallengeGame;