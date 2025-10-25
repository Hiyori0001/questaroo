"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Award, Zap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Quest {
  id: string;
  title: string;
  description: string;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  timeEstimate: string;
}

const dummyQuests: Quest[] = [
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
];

const QuestList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {dummyQuests.map((quest) => (
        <Card key={quest.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
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
            </div>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
              Start Quest
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuestList;