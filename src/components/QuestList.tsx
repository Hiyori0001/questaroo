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

interface QuestListProps {
  quests: Quest[]; // Accept quests as a prop
}

const QuestList: React.FC<QuestListProps> = ({ quests }) => {
  if (quests.length === 0) {
    return (
      <p className="text-center text-lg text-gray-500 dark:text-gray-400 mt-8">
        No quests found matching your criteria.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quests.map((quest) => (
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