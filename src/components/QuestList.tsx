"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Award, Zap, Clock, Lock } from "lucide-react"; // Import Lock icon
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom"; // Import Link
import { useUserProfile, XP_THRESHOLDS } from "@/contexts/UserProfileContext"; // Import useUserProfile and XP_THRESHOLDS

interface Quest {
  id: string;
  title: string;
  description: string;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  timeEstimate: string;
  timeLimit?: string; // New: Optional strict time limit
}

interface QuestListProps {
  quests: Quest[]; // Accept quests as a prop
}

const QuestList: React.FC<QuestListProps> = ({ quests }) => {
  const { profile, loadingProfile } = useUserProfile();

  if (quests.length === 0) {
    return (
      <p className="text-center text-lg text-gray-500 dark:text-gray-400 mt-8">
        No quests found matching your criteria.
      </p>
    );
  }

  const getRequiredXp = (difficulty: Quest["difficulty"]) => {
    switch (difficulty) {
      case "Easy":
        return XP_THRESHOLDS.EASY;
      case "Medium":
        return XP_THRESHOLDS.QUEST_MEDIUM;
      case "Hard":
        return XP_THRESHOLDS.QUEST_HARD;
      default:
        return 0;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quests.map((quest) => {
        const requiredXp = getRequiredXp(quest.difficulty);
        const isLocked = profile && profile.totalExperience < requiredXp; // Use totalExperience for unlocking

        return (
          <Card key={quest.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 font-heading">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                {quest.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> {quest.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-2 space-y-3">
              <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed">{quest.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {quest.difficulty}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> {quest.reward}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {quest.timeEstimate}
                </Badge>
                {quest.timeLimit && ( // Display time limit if it exists
                  <Badge variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    <Clock className="h-3 w-3" /> Limit: {quest.timeLimit}
                  </Badge>
                )}
                {isLocked && (
                  <Badge className="flex items-center gap-1 bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                    <Lock className="h-3 w-3" /> Requires {requiredXp} XP
                  </Badge>
                )}
              </div>
              <Button
                asChild
                className="w-full mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                disabled={isLocked || loadingProfile}
              >
                <Link to={`/location-quests/${quest.id}`}>
                  {isLocked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" /> Locked
                    </>
                  ) : (
                    "Start Quest"
                  )}
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuestList;