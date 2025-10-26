"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Award, Zap, Clock, ArrowLeft, CheckCircle2, HelpCircle, QrCode, Trash2, Lock, UserX, LocateFixed, Compass, Camera, Hourglass, XCircle } from "lucide-react"; // Added Hourglass, XCircle
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { allDummyQuests, Quest } from "@/data/quests";
import { useUserProfile, XP_THRESHOLDS } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import QuestQrScanner from "@/components/QuestQrScanner";
import QuestImageUploader from "@/components/QuestImageUploader";
import { useUserQuests } from "@/contexts/UserQuestsContext";
import { useTeams } from "@/contexts/TeamContext";
import { haversineDistance } from "@/utils/location";
import { supabase } from "@/lib/supabase"; // Import supabase client
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// IMPORTANT: This ID is for the Head Admin who can bypass certain restrictions for testing.
// It should match the DEVELOPER_USER_ID in AdminUserManagement.tsx
const HEAD_ADMIN_ID = "6187dac6-1eac-4d78-ab27-61e31c334a05";

// Helper function to get XP reward for completing a quest based on difficulty
const getXpForDifficulty = (difficulty: Quest["difficulty"]) => {
  switch (difficulty) {
    case "Easy":
      return 100; // Example XP reward for Easy
    case "Medium":
      return 250; // Example XP reward for Medium
    case "Hard":
      return 500; // Example XP reward for Hard
    default:
      return 0;
  }
};

interface UserQuestProgress {
  quest_id: string;
  status: 'started' | 'completed' | 'failed';
  verification_status: 'pending' | 'approved' | 'rejected' | 'not_applicable';
  completion_image_url: string | null;
  started_at: string;
  completed_at: string | null;
}

const QuestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: loadingAuth } = useAuth();
  const { profile, loadingProfile, addExperience, deductExperience, addAchievement, startQuest, completeQuest, submitImageForVerification } = useUserProfile();
  const { userQuests, loadingUserQuests, removeQuest } = useUserQuests();
  const { userTeam, addTeamScore } = useTeams();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [userQuestProgress, setUserQuestProgress] = useState<UserQuestProgress | null>(null);
  const [completionAnswer, setCompletionAnswer] = useState("");
  const [showCompletionInput, setShowCompletionInput] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [isUserCreatedQuest, setIsUserCreatedQuest] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isQuestUnlocked, setIsQuestUnlocked] = useState(false);
  const [locationVerificationLoading, setLocationVerificationLoading] = useState(false);

  const isCurrentUserHeadAdmin = user?.id === HEAD_ADMIN_ID;
  const allowHeadAdminSelfComplete = import.meta.env.VITE_ALLOW_HEAD_ADMIN_SELF_COMPLETE === 'true';
  const canHeadAdminBypassCreatorRestriction = isCurrentUserHeadAdmin && allowHeadAdminSelfComplete;

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

  const fetchUserQuestProgress = useCallback(async (userId: string, questId: string) => {
    const { data, error } = await supabase
      .from('user_quest_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_id', questId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching user quest progress:", error);
      setUserQuestProgress(null);
    } else if (data) {
      setUserQuestProgress(data as UserQuestProgress);
    } else {
      setUserQuestProgress(null);
    }
  }, []);

  useEffect(() => {
    if (id) {
      const allAvailableQuests = [...allDummyQuests, ...userQuests];
      const foundQuest = allAvailableQuests.find((q) => q.id === id);

      if (foundQuest) {
        setQuest(foundQuest);
        const isCreatedByUser = userQuests.some(uq => uq.id === foundQuest.id);
        setIsUserCreatedQuest(isCreatedByUser);

        if (user && isCreatedByUser) {
          const creatorQuest = userQuests.find(uq => uq.id === foundQuest.id);
          setIsCreator(creatorQuest?.user_id === user.id && !canHeadAdminBypassCreatorRestriction);
        } else {
          setIsCreator(false);
        }

        if (profile) {
          const requiredXp = getRequiredXp(foundQuest.difficulty);
          setIsQuestUnlocked(profile.experience >= requiredXp);
        }

        if (user) {
          fetchUserQuestProgress(user.id, foundQuest.id);
        }
      } else {
        toast.error("Quest not found!");
        navigate("/location-quests");
      }
    }
  }, [id, navigate, profile, user, userQuests, canHeadAdminBypassCreatorRestriction, fetchUserQuestProgress]);

  const questStarted = userQuestProgress?.status === 'started';
  const questCompleted = userQuestProgress?.status === 'completed';
  const questFailed = userQuestProgress?.status === 'failed';
  const isPendingVerification = userQuestProgress?.verification_status === 'pending';
  const isRejectedVerification = userQuestProgress?.verification_status === 'rejected';

  if (loadingAuth || loadingProfile || loadingUserQuests || !quest) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4 flex-grow">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading quest details...</p>
      </div>
    );
  }

  const xpForDifficulty = getXpForDifficulty(quest.difficulty);
  const requiredXpToUnlock = getRequiredXp(quest.difficulty);

  const completeQuestLogic = async () => {
    // This function is now only for non-image verification quests
    // For image quests, completion is handled by verifyQuestCompletion in UserProfileContext
    await addExperience(xpForDifficulty);
    await addAchievement({
      name: `Completed: ${quest.title}`,
      iconName: "Trophy",
      color: "bg-green-500",
    });
    await completeQuest(quest.id); // This now only updates status to 'completed'

    if (userTeam) {
      await addTeamScore(userTeam.id, xpForDifficulty);
    }

    // Re-fetch progress to update UI
    if (user) fetchUserQuestProgress(user.id, quest.id);

    setShowCompletionInput(false);
    setShowQrScanner(false);
    setShowImageUploader(false);
    setCompletionAnswer("");
    toast.success(`Quest "${quest.title}" completed! You earned ${xpForDifficulty} XP!`);
  };

  const handleStartQuest = async () => {
    if (!user) {
      toast.error("Please log in to start a quest.");
      navigate("/auth");
      return;
    }
    if (isCreator && !canHeadAdminBypassCreatorRestriction) {
      toast.error("You cannot start a quest you created yourself.");
      return;
    }
    if (!isQuestUnlocked) {
      toast.error(`You need ${requiredXpToUnlock} XP to start this quest.`);
      return;
    }
    await startQuest(quest.id);
    // Re-fetch progress to update UI
    if (user) fetchUserQuestProgress(user.id, quest.id);
    setShowCompletionInput(false);
    setShowQrScanner(false);
    setShowImageUploader(false);
    setCompletionAnswer("");
    toast.success(`Starting quest: ${quest.title}! Good luck!`);
  };

  const handleUnlockQuest = async () => {
    if (!user || !profile) {
      toast.error("You must be logged in to unlock quests.");
      navigate("/auth");
      return;
    }
    if (isCreator && !canHeadAdminBypassCreatorRestriction) {
      toast.error("You cannot unlock a quest you created yourself.");
      return;
    }
    if (profile.experience < requiredXpToUnlock) {
      toast.error("Not enough XP to unlock this quest.");
      return;
    }

    const success = await deductExperience(requiredXpToUnlock);
    if (success) {
      setIsQuestUnlocked(true);
      toast.success(`Quest "${quest.title}" unlocked for ${requiredXpToUnlock} XP!`);
    }
  };

  const handleAttemptCompletion = () => {
    if (!user) {
      toast.error("You must be logged in to complete a quest.");
      navigate("/auth");
      return;
    }
    if (isCreator && !canHeadAdminBypassCreatorRestriction) {
      toast.error("You cannot complete a quest you created yourself.");
      return;
    }
    if (questCompleted) {
      toast.info("You've already completed this quest!");
      return;
    }
    if (isPendingVerification) {
      toast.info("Your submission is currently awaiting review.");
      return;
    }
    if (isRejectedVerification) {
      toast.info("Your previous submission was rejected. Please try again!");
      // Optionally, allow re-submission by resetting status or showing uploader again
      setShowImageUploader(true); // Allow re-upload
      return;
    }

    if (quest.qrCode) {
      setShowQrScanner(true);
    } else if (quest.completionTask) {
      setShowCompletionInput(true);
    } else if (quest.completionImagePrompt) {
      setShowImageUploader(true);
    } else if (quest.latitude !== undefined && quest.longitude !== undefined && quest.verificationRadius !== undefined) {
      handleVerifyLocation();
    } else {
      toast.info("No specific completion task for this quest. Completing now!");
      completeQuestLogic();
    }
  };

  const handleQuestionAnswerSubmit = async () => {
    if (quest.completionTask && completionAnswer.toLowerCase().trim() === quest.completionTask.answer.toLowerCase().trim()) {
      await completeQuestLogic();
    } else {
      toast.error("Incorrect answer. Try again!");
    }
  };

  const handleQrScanSubmit = async (scannedCode: string) => {
    if (quest.qrCode && scannedCode.toUpperCase() === quest.qrCode.toUpperCase()) {
      await completeQuestLogic();
    } else {
      toast.error("Incorrect QR code. Please try again!");
    }
  };

  const handleImageUploadSubmit = async () => {
    // This function is now just a wrapper to trigger the uploader dialog
    setShowImageUploader(true);
  };

  const handleVerifyLocation = async () => {
    if (!user) {
      toast.error("You must be logged in to verify location.");
      navigate("/auth");
      return;
    }
    if (isCreator && !canHeadAdminBypassCreatorRestriction) {
      toast.error("You cannot complete a quest you created yourself.");
      return;
    }
    if (questCompleted) {
      toast.info("You've already completed this quest!");
      return;
    }
    if (quest.latitude === undefined || quest.longitude === undefined || quest.verificationRadius === undefined) {
      toast.error("Quest location details are missing for verification.");
      return;
    }

    setLocationVerificationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          const distance = haversineDistance(userLat, userLon, quest.latitude!, quest.longitude!);

          if (distance <= quest.verificationRadius!) {
            await completeQuestLogic();
            toast.success(`Location verified! You are ${distance.toFixed(2)} meters from the target.`);
          } else {
            toast.error(`You are too far! You are ${distance.toFixed(2)} meters away, but need to be within ${quest.verificationRadius} meters.`);
          }
          setLocationVerificationLoading(false);
        },
        (error) => {
          console.error("Error getting user location for verification:", error);
          toast.error("Failed to get your location for verification. Please enable location services.");
          setLocationVerificationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser for location verification.");
      setLocationVerificationLoading(false);
    }
  };

  const handleDeleteQuest = () => {
    if (quest) {
      removeQuest(quest.id);
      navigate("/location-quests");
    }
  };

  const canDeleteQuest = user && (isUserCreatedQuest || profile?.isAdmin);

  const isLocationCompletionMethod = quest.latitude !== undefined && quest.longitude !== undefined && quest.verificationRadius !== undefined;

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/location-quests")}
              className="self-start text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quests
            </Button>
            {canDeleteQuest && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Quest
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-gray-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                      This action cannot be undone. This will permanently delete your quest.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteQuest} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
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
            {quest.timeLimit && (
              <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                <Clock className="h-4 w-4" /> Time Limit: {quest.timeLimit}
              </Badge>
            )}
            {quest.difficulty !== "Easy" && !isQuestUnlocked && (
              <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                <Lock className="h-4 w-4" /> Locked: {requiredXpToUnlock} XP
              </Badge>
            )}
            {isLocationCompletionMethod && (
              <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <LocateFixed className="h-4 w-4" /> Location Verification ({quest.verificationRadius}m)
              </Badge>
            )}
            {quest.completionImagePrompt && (
              <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                <Camera className="h-4 w-4" /> Image Upload
              </Badge>
            )}
          </div>

          {!user && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">
              You must be logged in to start or complete quests.
            </p>
          )}

          {user && isCreator && !canHeadAdminBypassCreatorRestriction && (
            <p className="text-lg font-semibold text-red-600 dark:text-red-400 mt-4 flex items-center justify-center gap-2">
              <UserX className="h-5 w-5" /> You created this quest and cannot complete it yourself.
            </p>
          )}

          {user && isQuestUnlocked && !questStarted && !questCompleted && !questFailed && (isCreator ? canHeadAdminBypassCreatorRestriction : true) && (
            <Button
              onClick={handleStartQuest}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-lg py-3"
              disabled={!user || (isCreator && !canHeadAdminBypassCreatorRestriction)}
            >
              Start Quest
            </Button>
          )}

          {questStarted && !questCompleted && !questFailed && !showCompletionInput && !showQrScanner && !showImageUploader && (isCreator ? canHeadAdminBypassCreatorRestriction : true) && (
            <>
              {isPendingVerification ? (
                <Button
                  className="w-full mt-6 bg-yellow-500 dark:bg-yellow-700 text-white text-lg py-3 cursor-not-allowed"
                  disabled
                >
                  <Hourglass className="h-5 w-5 mr-2" /> Awaiting Review...
                </Button>
              ) : isRejectedVerification ? (
                <Button
                  onClick={handleAttemptCompletion} // Allow re-attempt
                  className="w-full mt-6 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-lg py-3"
                >
                  <XCircle className="h-5 w-5 mr-2" /> Submission Rejected. Re-attempt?
                </Button>
              ) : (
                <Button
                  onClick={handleAttemptCompletion}
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-lg py-3"
                  disabled={(isCreator && !canHeadAdminBypassCreatorRestriction) || locationVerificationLoading}
                >
                  {quest.qrCode ? (
                    <>
                      <QrCode className="h-5 w-5 mr-2" /> Scan QR Code to Complete
                    </>
                  ) : quest.completionImagePrompt ? (
                    <>
                      <Camera className="h-5 w-5 mr-2" /> Upload Image to Complete
                    </>
                  ) : isLocationCompletionMethod ? (
                    <>
                      {locationVerificationLoading ? (
                        <Compass className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <LocateFixed className="h-5 w-5 mr-2" />
                      )}
                      {locationVerificationLoading ? "Verifying Location..." : "Verify Location to Complete"}
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-5 w-5 mr-2" /> Ready to Complete?
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {questStarted && !questCompleted && !questFailed && showCompletionInput && quest.completionTask && (isCreator ? canHeadAdminBypassCreatorRestriction : true) && (
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
                disabled={completionAnswer.trim() === "" || (isCreator && !canHeadAdminBypassCreatorRestriction)}
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

          {questFailed && (
            <Button
              className="w-full mt-6 bg-red-400 dark:bg-red-600 text-lg py-3 cursor-not-allowed"
              disabled
            >
              <XCircle className="h-5 w-5 mr-2" /> Quest Failed!
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

      {quest.completionImagePrompt && (
        <QuestImageUploader
          isOpen={showImageUploader}
          onClose={() => setShowImageUploader(false)}
          questId={quest.id}
          completionImagePrompt={quest.completionImagePrompt}
        />
      )}
    </div>
  );
};

export default QuestDetailsPage;