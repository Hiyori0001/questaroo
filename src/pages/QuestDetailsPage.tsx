"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Award, Zap, Clock, ArrowLeft, CheckCircle2, HelpCircle, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { allDummyQuests, Quest } from "@/data/quests";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import QuestQrScanner from "@/components/QuestQrScanner";
import { useUserQuests } from "@/contexts/UserQuestsContext"; // Import useUserQuests

const QuestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: loadingAuth } = useAuth();
  const { addExperience, addAchievement, profile, loadingProfile } = useUserProfile();
  const { userQuests, loadingUserQuests } = useUserQuests(); // Get user-created quests

  const [quest, setQuest] = useState<Quest | null>(null);
  const [questStarted, setQuestStarted] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [completionAnswer, setCompletionAnswer] = useState("");
  const [showCompletionInput, setShowCompletionInput] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  useEffect(() => {
    if (id) {
      // Combine dummy quests and user-created quests to find the quest
      const allAvailableQuests = [...allDummyQuests, ...userQuests];
      const foundQuest = allAvailableQuests.find((q) => q.id === id);

      if (foundQuest) {
        setQuest(foundQuest);
        if (profile && profile.achievements.some(a => a.name === `Completed: ${foundQuest.title}`)) {
          setQuestCompleted(true);
        }
      } else {
        toast.error("Quest not found!");
        navigate("/location-quests");
      }
    }
  }, [id, navigate, profile, userQuests]); // Added userQuests to dependencies

  if (loadingAuth || loadingProfile || loadingUserQuests || !quest) {
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

  const completeQuestLogic = () => {
    const xpEarned = getXpForDifficulty(quest.difficulty);
    addExperience(xpEarned);
    addAchievement({
      name: `Completed: ${quest.title}`,
      iconName: "Trophy",
      color: "bg-green-500",
    });
    setQuestCompleted(true);
    setQuestStarted(false);
    setShowCompletionInput(false);
    setShowQrScanner(false);
    setCompletionAnswer("");
    toast.success(`Quest "${quest.title}" completed! You earned ${xpEarned} XP!`);
  };

  const handleStartQuest = () => {
    if (!user) {
      toast.error("Please log in to start a quest.");
      navigate("/auth");
      return;
    }
    setQuestStarted(true);
    setShowCompletionInput(false);
    setShowQrScanner(false);
    setCompletionAnswer("");
    toast.success(`Starting quest: ${quest.title}! Good luck!`);
  };

  const handleAttemptCompletion = () => {
    if (!user) {
      toast.error("You must be logged in to complete a quest.");
      navigate("/auth");
      return;
    }
    if (questCompleted) {
      toast.info("You've already completed this quest!");
      return;
    }

    if (quest.qrCode) {
      setShowQrScanner(true);
    } else if (quest.completionTask) {
      setShowCompletionInput(true);
    } else {
      // Fallback for quests without specific completion tasks (shouldn't happen with current data)
      toast.info("No specific completion task for this quest. Completing now!");
      completeQuestLogic();
    }
  };

  const handleQuestionAnswerSubmit = () => {
    if (quest.completionTask && completionAnswer.toLowerCase().trim() === quest.completionTask.answer.toLowerCase().trim()) {
      completeQuestLogic();
    } else {
      toast.error("Incorrect answer. Try again!");
    }
  };

  const handleQrScanSubmit = (scannedCode: string) => {
    if (quest.qrCode && scannedCode.toUpperCase() === quest.qrCode.toUpperCase()) {
      completeQuestLogic();
    } else {
      toast.error("Incorrect QR code. Please try again!");
    }
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
            {quest.timeLimit && ( // Display time limit if it exists
              <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                <Clock className="h-4 w-4" /> Time Limit: {quest.timeLimit}
              </Badge>
            )}
          </div>

          {!user && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">
              You must be logged in to start or complete quests.
            </p>
          )}

          {!questStarted && !questCompleted && (
            <Button
              onClick={handleStartQuest}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-lg py-3"
              disabled={!user}
            >
              Start Quest
            </Button>
          )}

          {questStarted && !questCompleted && !showCompletionInput && !showQrScanner && (
            <Button
              onClick={handleAttemptCompletion}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-lg py-3"
            >
              {quest.qrCode ? (
                <>
                  <QrCode className="h-5 w-5 mr-2" /> Scan QR Code to Complete
                </>
              ) : (
                <>
                  <HelpCircle className="h-5 w-5 mr-2" /> Ready to Complete?
                </>
              )}
            </Button>
          )}

          {questStarted && !questCompleted && showCompletionInput && quest.completionTask && (
            <div className="mt-6 space-y-4">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Completion Task: {quest.completionTask.question}
              </p>
              <Input
                type="text"
                placeholder="Enter your answer here"
                value={completionAnswer}
                onChange={(e) => setCompletionAnswer(e.target.value)}
                className="text-center text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleQuestionAnswerSubmit();
                  }
                }}
              />
              <Button
                onClick={handleQuestionAnswerSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-lg py-3"
                disabled={completionAnswer.trim() === ""}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" /> Submit Answer & Complete Quest
              </Button>
            </div>
          )}

          {questCompleted && (
            <Button
              className="w-full mt-6 bg-gray-400 dark:bg-gray-600 text-lg py-3 cursor-not-allowed"
              disabled
            >
              <CheckCircle2 className="h-5 w-5 mr-2" /> Quest Completed!
            </Button>
          )}
        </CardContent>
      </Card>

      {quest.qrCode && (
        <QuestQrScanner
          isOpen={showQrScanner}
          onClose={() => setShowQrScanner(false)}
          onScanComplete={handleQrScanSubmit}
          expectedQrCode={quest.qrCode}
        />
      )}
    </div>
  );
};

export default QuestDetailsPage;