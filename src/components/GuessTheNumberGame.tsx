"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const GuessTheNumberGame = () => {
  const [targetNumber, setTargetNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuess(e.target.value);
  };

  const checkGuess = () => {
    const parsedGuess = parseInt(guess);

    if (isNaN(parsedGuess) || parsedGuess < 1 || parsedGuess > 100) {
      toast.error("Please enter a number between 1 and 100.");
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
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setMessage("");
    setAttempts(0);
    setGameOver(false);
    toast.info("New game started!");
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
      <CardHeader>
        <Lightbulb className="h-16 w-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Guess the Number!
        </CardTitle>
        <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
          I'm thinking of a number between 1 and 100. Can you guess it?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="number"
          placeholder="Enter your guess"
          value={guess}
          onChange={handleGuessChange}
          disabled={gameOver}
          className="text-center text-lg"
          min="1"
          max="100"
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