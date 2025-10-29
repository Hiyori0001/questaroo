"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clicksRef = useRef(clicks); // Use a ref to store the latest clicks value

  // Update clicksRef whenever clicks state changes
  useEffect(() => {
    clicksRef.current = clicks;
  }, [clicks]);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setIsRunning(true);
    setGameOver(false);
    // Removed: toast.info("Clicker Challenge started! Click as fast as you can!");
  };

  const resetGame = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setClicks(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setIsRunning(false);
    setGameOver(false);
    toast.info("Clicker Challenge reset.");
  }, []);

  // Main timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time is up
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsRunning(false);
            setGameOver(true);
            // The toast for game over will be handled by the separate useEffect below
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      // If game is stopped (not running) and an interval is active, clear it
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup function: clear interval when component unmounts or isRunning changes to false
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]); // Only re-run when isRunning changes

  // Effect to handle game over state and display final score
  useEffect(() => {
    if (gameOver) {
      toast.success(`Time's up! You clicked ${clicksRef.current} times!`);
    }
  }, [gameOver]); // Only re-run when gameOver changes

  const handleClick = () => {
    if (isRunning) {
      setClicks((prevClicks) => prevClicks + 1);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
      <CardHeader>
        <MousePointerClick className="h-16 w-16 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
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