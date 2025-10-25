"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Award, Zap, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Dummy quests data (copied from LocationQuests for standalone page functionality)
interface Quest {
  id: string;
  title: string;
  description: string;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  timeEstimate: string;
}

const allDummyQuests: Quest[] = [
  {
    id: "q1",
    title: "The Whispering Woods Mystery",
    description: "Explore the old Whispering Woods and uncover the secret of the ancient tree. Requires keen observation!",
    location: "Central Park, New York",
    difficulty: "Medium",
    reward: "500 XP, 'Forest Explorer' Badge",
    timeEstimate: "30-45 min",
  },
  {
    id: "q2",
    title: "Downtown Scavenger Hunt",
    description: "Follow clues across the city center to find hidden landmarks and solve riddles.",
    location: "Downtown City Center",
    difficulty: "Hard",
    reward: "800 XP, 'Urban Pathfinder' Title",
    timeEstimate: "60-90 min",
  },
  {
    id: "q3",
    title: "Riverside Riddle Challenge",
    description: "A series of easy riddles located along the scenic riverside path. Perfect for a casual stroll.",
    location: "Riverside Promenade",
    difficulty: "Easy",
    reward: "250 XP, 'Riddle Solver' Badge",
    timeEstimate: "20-30 min",
  },
  {
    id: "q4",
    title: "Historic District Photo Op",
    description: "Visit historical sites and capture specific photos to complete this visual quest.",
    location: "Old Town Historic District",
    difficulty: "Medium",
    reward: "400 XP, 'History Buff' Achievement",
    timeEstimate: "45-60 min",
  },
  {
    id: "q5",
    title: "Museum Marvels Tour",
    description: "A quest through the city's finest museums, solving art and history puzzles.",
    location: "Museum Quarter, Cityville",
    difficulty: "Medium",
    reward: "600 XP, 'Culture Enthusiast' Badge",
    timeEstimate: "90-120 min",
  },
  {
    id: "q6",
    title: "Parkland Puzzle Pursuit",
    description: "Navigate through various parks, finding clues and completing nature-themed challenges.",
    location: "Green Valley Park",
    difficulty: "Easy",
    reward: "300 XP, 'Nature Lover' Achievement",
    timeEstimate: "40-50 min",
  },
];

const QuestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quest, setQuest] = useState<Quest | null>(null);

  useEffect(() => {
    if (id) {
      const foundQuest = allDummyQuests.find((q) => q.id === id);
      if (foundQuest) {
        setQuest(foundQuest);
      } else {
        toast.error("Quest not found!");
        navigate("/location-quests"); // Redirect if quest not found
      }
    }
  }, [id, navigate]);

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading quest details...</p>
      </div>
    );
  }

  const handleStartQuest = () => {
    toast.success(`Starting quest: ${quest.title}! Good luck!`);
    // In a real app, this would initiate the quest logic
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6">
        <CardHeader className="pb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/location-quests")}
            className="self-start mb-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quests
          </Button>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <MapPin className="h-7 w-7 text-green-600 dark:text-green-400" />
            {quest.title}
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <MapPin className="h-5 w-5" /> {quest.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-4">
          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
            {quest.description}
          </p>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <Zap className="h-4 w-4" /> Difficulty: {quest.difficulty}
            </Badge>
            <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
              <Award className="h-4 w-4" /> Reward: {quest.reward}
            </Badge>
            <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <Clock className="h-4 w-4" /> Time Estimate: {quest.timeEstimate}
            </Badge>
          </div>
          <Button
            onClick={handleStartQuest}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-lg py-3"
          >
            Start Quest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestDetailsPage;