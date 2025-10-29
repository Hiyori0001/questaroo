"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const GuessTheNumberGame = () => {
  const [minRangeInput, setMinRangeInput] = useState<string>("1");
  const [maxRangeInput, setMaxRangeInput] = useState<string>("100");
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(100);

  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateTargetNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const initializeGame = (newMin: number, newMax: number) => {
    if (newMin >= newMax) {
      toast.error("Min number must be less than Max number.");
      return false;
    }
    setMinRange(newMin);
    setMaxRange(newMax);
    setTargetNumber(generateTargetNumber(newMin, newMax));
    setGuess("");
    setMessage("");
    setAttempts(0);
    setGameOver(false);
    toast.info(`New game started! Guess a number between ${newMin} and ${newMax}.`);
    return true;
  };

  useEffect(() => {
    initializeGame(minRange, maxRange);
  }, []); // Initialize once on mount with default ranges

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuess(e.target.value);
  };

  const handleSetRange = () => {
    const newMin = parseInt(minRangeInput);
    const newMax = parseInt(maxRangeInput);

    if (isNaN(newMin) || isNaN(newMax)) {
      toast.error("Please enter valid numbers for the range.");
      return;
    }

    if (initializeGame(newMin, newMax)) {
      // Game initialized successfully, no need for extra toast
    }
  };

  const checkGuess = () => {
    const parsedGuess = parseInt(guess);

    if (isNaN(parsedGuess) || parsedGuess < minRange || parsedGuess > maxRange) {
      toast.error(`Please enter a number between ${minRange} and ${maxRange}.`);
      return;
    }

    setAttempts(attempts + 1);

    if (parsedGuess === targetNumber) {
      setMessage(`Congratulations! You guessed the number ${targetNumber} in ${attempts + 1} attempts.`);
      setGameOver(true);
      toast.success("You won the game!");
    } else if (parsedGuess < targetNumber) {
      setMessage("Too low! Try again.");
      toast.info("Your guess was too low.");
    } else {
      setMessage("Too high! Try again.");
      toast.info("Your guess was too high.");
    }
    setGuess(""); // Clear input after guess
  };

  const handleRestartGame = () => {
    initializeGame(minRange, maxRange); // Restart with current custom range
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
      <CardHeader>
        <Lightbulb className="h-16 w-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
          Guess the Number!
        </CardTitle>
        <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
          I'm thinking of a number between {minRange} and {maxRange}. Can you guess it?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Input
            type="number"
            placeholder="Min"
            value={minRangeInput}
            onChange={(e) => setMinRangeInput(e.target.value)}
            className="text-center text-lg w-1/2"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxRangeInput}
            onChange={(e) => setMaxRangeInput(e.target.value)}
            className="text-center text-lg w-1/2"
          />
        </div>
        <Button onClick={handleSetRange} className="w-full mb-4 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
          Set Range & Restart
        </Button>

        <Input
          type="number"
          placeholder="Enter your guess"
          value={guess}
          onChange={handleGuessChange}
          disabled={gameOver}
          className="text-center text-lg"
          min={minRange}
          max={maxRange}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !gameOver) {
              checkGuess();
            }
          }}
        />
        <Button onClick={checkGuess} disabled={gameOver || guess === ""} className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
          Guess
        </Button>
        {message && (
          <p className={`text-lg font-semibold ${gameOver ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-gray-200"}`}>
            {message}
          </p>
        )}
        {!gameOver && attempts > 0 && (
          <p className="text-sm text-muted-foreground">Attempts: {attempts}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center mt-6">
        <Button onClick={handleRestartGame} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          <RefreshCw className="h-4 w-4 mr-2" /> Play Again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GuessTheNumberGame;