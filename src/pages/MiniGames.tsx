"use client";

import React, { useState } from "react";
import TriviaGame from "@/components/TriviaGame";
import GuessTheNumberGame from "@/components/GuessTheNumberGame";
import ClickerChallengeGame from "@/components/ClickerChallengeGame";
import MemoryMatchGame from "@/components/MemoryMatchGame";
import ReactionTimeGame from "@/components/ReactionTimeGame";
import LightsOffGame from "@/components/LightsOffGame"; // Import the new game
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2, Brain, Lightbulb, MousePointerClick, Puzzle, Zap, Grid } from "lucide-react"; // Import Grid icon for Lights Off
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            Here you'll find a variety of mini-games to play. Choose your challenge!
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="trivia" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-6 mb-6"> {/* Adjusted grid-cols to 6 */}
          <TabsTrigger value="trivia">
            <Brain className="h-4 w-4 mr-2" /> Trivia
          </TabsTrigger>
          <TabsTrigger value="guess-number">
            <Lightbulb className="h-4 w-4 mr-2" /> Guess the Number
          </TabsTrigger>
          <TabsTrigger value="clicker-challenge">
            <MousePointerClick className="h-4 w-4 mr-2" /> Clicker
          </TabsTrigger>
          <TabsTrigger value="memory-match">
            <Puzzle className="h-4 w-4 mr-2" /> Memory
          </TabsTrigger>
          <TabsTrigger value="reaction-time">
            <Zap className="h-4 w-4 mr-2" /> Reaction
          </TabsTrigger>
          <TabsTrigger value="lights-off"> {/* New tab trigger */}
            <Grid className="h-4 w-4 mr-2" /> Lights Off
          </TabsTrigger>
        </TabsList>
        <TabsContent value="trivia">
          <TriviaGame />
        </TabsContent>
        <TabsContent value="guess-number">
          <GuessTheNumberGame />
        </TabsContent>
        <TabsContent value="clicker-challenge">
          <ClickerChallengeGame />
        </TabsContent>
        <TabsContent value="memory-match">
          <MemoryMatchGame />
        </TabsContent>
        <TabsContent value="reaction-time">
          <ReactionTimeGame />
        </TabsContent>
        <TabsContent value="lights-off"> {/* New tab content */}
          <LightsOffGame />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MiniGames;