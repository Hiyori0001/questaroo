"use client";

import React from "react";
import TriviaGame from "@/components/TriviaGame";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

const MiniGames = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center mb-8">
        <CardHeader>
          <Gamepad2 className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mini-Games & Challenges
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Test your skills and knowledge with fun digital challenges!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed">
            Here you'll find a variety of mini-games to play. Start with our trivia challenge!
          </p>
        </CardContent>
      </Card>

      <TriviaGame />
    </div>
  );
};

export default MiniGames;