"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const triviaQuestions: Question[] = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Mars",
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: "Pacific",
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
    correctAnswer: "Leonardo da Vinci",
  },
];

const TriviaGame = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentQuestion = triviaQuestions[currentQuestionIndex];

  const handleAnswerClick = (option: string) => {
    if (selectedAnswer === null) { // Only allow selecting an answer once per question
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
    if (currentQuestionIndex < triviaQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameOver(true);
    }
  };

  const handleRestartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameOver(false);
  };

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
            Your final score: {score} / {triviaQuestions.length}
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
          Question {currentQuestionIndex + 1} of {triviaQuestions.length}
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
          {currentQuestionIndex < triviaQuestions.length - 1 ? "Next Question" : "Finish Game"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TriviaGame;