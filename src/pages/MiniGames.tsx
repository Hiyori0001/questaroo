"use client";

import React, { useState } from "react";
import TriviaGame from "@/components/TriviaGame";
import GuessTheNumberGame from "@/components/GuessTheNumberGame";
import ClickerChallengeGame from "@/components/ClickerChallengeGame";
import MemoryMatchGame from "@/components/MemoryMatchGame";
import ReactionTimeGame from "@/components/ReactionTimeGame";
import LightsOnGame from "@/components/LightsOnGame";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2, Brain, Lightbulb, MousePointerClick, Puzzle, Zap, Lock } from "lucide-react"; // Import Lock icon
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile, XP_THRESHOLDS } from "@/contexts/UserProfileContext"; // Import useUserProfile and XP_THRESHOLDS
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface MiniGameConfig {
  value: string;
  label: string;
  icon: React.ElementType;
  component: React.ElementType;
  xpCost: number;
}

const miniGamesConfig: MiniGameConfig[] = [
  { value: "trivia", label: "Trivia", icon: Brain, component: TriviaGame, xpCost: 0 }, // Free
  { value: "guess-number", label: "Guess the Number", icon: Lightbulb, component: GuessTheNumberGame, xpCost: XP_THRESHOLDS.MINIGAME_GUESS_NUMBER },
  { value: "clicker-challenge", label: "Clicker", icon: MousePointerClick, component: ClickerChallengeGame, xpCost: XP_THRESHOLDS.MINIGAME_CLICKER_CHALLENGE },
  { value: "memory-match", label: "Memory", icon: Puzzle, component: MemoryMatchGame, xpCost: XP_THRESHOLDS.MINIGAME_MEMORY_MATCH },
  { value: "reaction-time", label: "Reaction", icon: Zap, component: ReactionTimeGame, xpCost: XP_THRESHOLDS.MINIGAME_REACTION_TIME },
  { value: "lights-on", label: "Lights On", icon: Lightbulb, component: LightsOnGame, xpCost: XP_THRESHOLDS.MINIGAME_LIGHTS_ON },
];

const MiniGames = () => {
  const { profile, loadingProfile, deductExperience } = useUserProfile();
  const [unlockedGames, setUnlockedGames] = useState<Set<string>>(() => {
    // Initialize from localStorage or default to free games
    if (typeof window !== 'undefined') {
      const savedUnlocked = localStorage.getItem("unlockedMiniGames");
      return new Set(savedUnlocked ? JSON.parse(savedUnlocked) : ["trivia"]);
    }
    return new Set(["trivia"]);
  });
  const [activeTab, setActiveTab] = useState<string>("trivia");

  // Save unlocked games to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("unlockedMiniGames", JSON.stringify(Array.from(unlockedGames)));
    }
  }, [unlockedGames]);

  const handleTabChange = (value: string) => {
    const game = miniGamesConfig.find(g => g.value === value);
    if (!game) return;

    if (unlockedGames.has(value)) {
      setActiveTab(value);
    } else {
      toast.error(`You need to unlock "${game.label}" for ${game.xpCost} XP.`);
    }
  };

  const handleUnlockGame = async (gameValue: string, xpCost: number) => {
    if (!profile) {
      toast.error("You must be logged in to unlock games.");
      console.log("handleUnlockGame: Not logged in or no profile.");
      return;
    }
    if (profile.experience < xpCost) {
      toast.error("Not enough XP to unlock this game.");
      console.log(`handleUnlockGame: Not enough XP. Current: ${profile.experience}, Needed: ${xpCost}`);
      return;
    }

    console.log(`handleUnlockGame: Attempting to unlock ${gameValue} for ${xpCost} XP.`);
    const success = await deductExperience(xpCost);
    console.log(`handleUnlockGame: deductExperience returned: ${success}`);

    if (success) {
      setUnlockedGames((prev) => new Set(prev).add(gameValue));
      setActiveTab(gameValue);
      toast.success(`"${miniGamesConfig.find(g => g.value === gameValue)?.label}" unlocked for ${xpCost} XP!`);
      console.log(`handleUnlockGame: Successfully unlocked ${gameValue}.`);
    } else {
      console.log(`handleUnlockGame: Failed to unlock ${gameValue}.`);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6 h-auto"> {/* Adjusted grid-cols for better mobile */}
          {miniGamesConfig.map((game) => {
            const isLocked = !unlockedGames.has(game.value);
            const Icon = game.icon;
            return (
              <TabsTrigger
                key={game.value}
                value={game.value}
                disabled={isLocked && !profile} // Disable if locked and not logged in
                className="flex flex-col items-center justify-center p-2 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs sm:text-sm">{game.label}</span>
                {isLocked && (
                  <span className="text-xs text-muted-foreground flex items-center mt-1">
                    <Lock className="h-3 w-3 mr-1" /> {game.xpCost} XP
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {miniGamesConfig.map((game) => {
          const isLocked = !unlockedGames.has(game.value);
          const GameComponent = game.component;
          return (
            <TabsContent key={game.value} value={game.value}>
              {isLocked ? (
                <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
                  <CardHeader>
                    <Lock className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {game.label} is Locked!
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
                      You need {game.xpCost} XP to unlock this mini-game.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      Your XP: {profile?.experience ?? 0}
                    </p>
                    <Button
                      onClick={() => handleUnlockGame(game.value, game.xpCost)}
                      disabled={!profile || (profile && profile.experience < game.xpCost)}
                      className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                    >
                      <Lock className="h-4 w-4 mr-2" /> Unlock for {game.xpCost} XP
                    </Button>
                    {!profile && (
                      <p className="text-sm text-red-500 dark:text-red-400 mt-4">
                        Please log in to unlock games.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <GameComponent />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default MiniGames;