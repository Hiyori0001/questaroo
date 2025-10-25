"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { allTriviaQuestions, Question } from "@/data/triviaQuestions"; // Import from new data file

// Utility function to shuffle an array
const shuffleArray = <T extends unknown[]>(array: T): T => {
  const newArray = [...array] as T;
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const TriviaGame = () => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const initializeGame = useCallback(() => {
    // Always pick a new set of 5 random questions from the larger pool
    setShuffledQuestions(shuffleArray(allTriviaQuestions).slice(0, 5));
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const handleAnswerClick = (option: string) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(option);
      setShowFeedback(true);
      if (option === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameOver(true);
    }
  };

  const handleRestartGame = () => {
    initializeGame();
  };

  if (shuffledQuestions.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Loading trivia questions...</p>;
  }

  if (gameOver) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Game Over!</CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            You completed the trivia challenge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Your final score: {score} / {shuffledQuestions.length}
          </p>
          <Button onClick={handleRestartGame} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            <RefreshCw className="h-4 w-4 mr-2" /> Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
        </CardTitle>
        <CardDescription className="text-lg text-gray-800 dark:text-gray-200">
          {currentQuestion.question}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn(
              "w-full justify-start text-left py-3 px-4 rounded-md text-base",
              "hover:bg-gray-100 dark:hover:bg-gray-600",
              selectedAnswer === option && showFeedback && option === currentQuestion.correctAnswer && "bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300",
              selectedAnswer === option && showFeedback && option !== currentQuestion.correctAnswer && "bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300",
              selectedAnswer !== null && option === currentQuestion.correctAnswer && "border-green-500 dark:border-green-700" // Highlight correct answer after selection
            )}
            onClick={() => handleAnswerClick(option)}
            disabled={selectedAnswer !== null}
          >
            {option}
            {showFeedback && selectedAnswer === option && option === currentQuestion.correctAnswer && (
              <CheckCircle2 className="ml-auto h-5 w-5 text-green-600 dark:text-green-400" />
            )}
            {showFeedback && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
              <XCircle className="ml-auto h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </Button>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end mt-6">
        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {currentQuestionIndex < shuffledQuestions.length - 1 ? "Next Question" : "Finish Game"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TriviaGame;