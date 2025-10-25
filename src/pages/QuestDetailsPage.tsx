"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Award, Zap, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { allDummyQuests, Quest } from "@/data/quests";
import { useUserProfile } from "@/contexts/UserProfileContext"; // Import useUserProfile
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const QuestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: loadingAuth } = useAuth();
  const { addExperience, addAchievement, profile, loadingProfile } = useUserProfile();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [questStarted, setQuestStarted] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      const foundQuest = allDummyQuests.find((q) => q.id === id);
      if (foundQuest) {
        setQuest(foundQuest);
        // Check if this quest was already completed by the current user
        if (profile && profile.achievements.some(a => a.name === `Completed: ${foundQuest.title}`)) {
          setQuestCompleted(true);
        }
      } else {
        toast.error("Quest not found!");
        navigate("/location-quests"); // Redirect if quest not found
      }
    }
  }, [id, navigate, profile]); // Added profile to dependencies to check completion status

  if (loadingAuth || loadingProfile || !quest) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4 flex-grow">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading quest details...</p>
      </div>
    );
  }

  const getXpForDifficulty = (difficulty: Quest["difficulty"]): number => {
    switch (difficulty) {
      case "Easy":
        return 100;
      case "Medium":
        return 250;
      case "Hard":
        return 500;
      default:
        return 0;
    }
  };

  const handleStartQuest = () => {
    if (!user) {
      toast.error("Please log in to start a quest.");
      navigate("/auth");
      return;
    }
    setQuestStarted(true);
    toast.success(`Starting quest: ${quest.title}! Good luck!`);
  };

  const handleCompleteQuest = () => {
    if (!user) {
      toast.error("You must be logged in to complete a quest.");
      navigate("/auth");
      return;
    }
    if (questCompleted) {
      toast.info("You've already completed this quest!");
      return;
    }

    const xpEarned = getXpForDifficulty(quest.difficulty);
    addExperience(xpEarned);
    addAchievement({
      name: `Completed: ${quest.title}`,
      iconName: "Trophy",
      color: "bg-green-500",
    });
    setQuestCompleted(true);
    setQuestStarted(false); // Reset started state after completion
    toast.success(`Quest "${quest.title}" completed! You earned ${xpEarned} XP!`);
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
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
          {!questStarted && !questCompleted && (
            <Button
              onClick={handleStartQuest}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-lg py-3"
              disabled={!user}
            >
              Start Quest
            </Button>
          )}
          {questStarted && !questCompleted && (
            <Button
              onClick={handleCompleteQuest}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-lg py-3"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" /> Complete Quest (Simulated)
            </Button>
          )}
          {questCompleted && (
            <Button
              className="w-full mt-6 bg-gray-400 dark:bg-gray-600 text-lg py-3 cursor-not-allowed"
              disabled
            >
              <CheckCircle2 className="h-5 w-5 mr-2" /> Quest Completed!
            </Button>
          )}
          {!user && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">
              You must be logged in to start or complete quests.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestDetailsPage;