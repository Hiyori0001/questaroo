"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added Card import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, PlusCircle, Edit, Trash2, CalendarDays, Trophy, Users, Upload, Image as ImageIcon, Eye, CheckCircle2, XCircle, Hourglass } from "lucide-react"; // Added CheckCircle2, XCircle, Hourglass
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Quest } from "@/data/quests"; // Only import Quest interface
import { Link } from "react-router-dom";
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
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAllQuests } from "@/contexts/AllQuestsContext"; // Updated import

interface AdminQuest extends Quest {
  is_user_created: boolean;
}

interface PendingImageSubmission {
  id: string; // user_quest_progress ID
  user_id: string;
  quest_id: string; // This will be the actual quest ID (either user_quest_id or predefined_quest_id)
  is_predefined: boolean; // New: To know which table to reference
  completion_image_url: string;
  quest_title: string;
  user_name: string;
  user_avatar_url: string;
  xp_reward: number;
  team_id: string | null;
  creator_reference_image_url: string | null; // New: Creator's reference image URL
}

// Refactored getXpForDifficulty to be more robust
const getXpForDifficulty = (difficulty: "Easy" | "Medium" | "Hard"): number => { // Revert to specific types
  switch (difficulty) {
    case "Easy":
      return 100; // Example XP reward for Easy
    case "Medium":
      return 250; // Example XP reward for Medium
    case "Hard":
      return 500; // Example XP reward for Hard
    default:
      // This case should ideally not be reached if difficulty is strictly typed
      console.warn(`Unknown difficulty: ${difficulty}. Defaulting to 0 XP.`);
      return 0;
  }
};

const AdminQuestManagement = () => {
  const { user: currentUser } = useAuth();
  const { profile: currentUserProfile, verifyQuestCompletion } = useUserProfile();
  const { allQuests, loadingAllQuests, removeQuest } = useAllQuests(); // Updated hook and variable
  const [quests, setQuests] = useState<AdminQuest[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingImageSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestsAndSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // All quests are now fetched from the AllQuestsContext
      const formattedQuests: AdminQuest[] = allQuests.map(q => ({
        ...q,
        is_user_created: !q.is_predefined, // Use the new is_predefined flag
      }));
      setQuests(formattedQuests);

      // Fetch pending image submissions
      const { data: pendingData, error: pendingError } = await supabase
        .from('user_quest_progress')
        .select(`
          id,
          user_id,
          user_quest_id,
          predefined_quest_id,
          completion_image_url,
          profiles!user_id(first_name, last_name, avatar_url, team_id),
          user_quests!user_quest_id(title, difficulty, creator_reference_image_url),
          predefined_quests!predefined_quest_id(title, difficulty, creator_reference_image_url)
        `)
        .eq('verification_status', 'pending');

      if (pendingError) {
        throw pendingError;
      }

      const formattedPending: PendingImageSubmission[] = pendingData
        .filter(p => p.completion_image_url && (p.user_quests || p.predefined_quests)) // Ensure image and quest details exist from either table
        .map(p => {
          const isPredefined = p.predefined_quest_id !== null;
          const questDetails = isPredefined ? p.predefined_quests : p.user_quests;
          const questId = isPredefined ? p.predefined_quest_id : p.user_quest_id;

          return {
            id: p.id,
            user_id: p.user_id,
            quest_id: questId!, // Use the actual quest ID
            is_predefined: isPredefined,
            completion_image_url: p.completion_image_url!,
            quest_title: questDetails?.title || "Unknown Quest",
            user_name: `${p.profiles?.first_name || 'Adventure'} ${p.profiles?.last_name || 'Seeker'}`.trim(),
            user_avatar_url: p.profiles?.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(p.user_id)}`,
            xp_reward: getXpForDifficulty(questDetails?.difficulty as "Easy" | "Medium" | "Hard" || "Easy"),
            team_id: p.profiles?.team_id || null,
            creator_reference_image_url: questDetails?.creator_reference_image_url || null,
          };
        });
      setPendingSubmissions(formattedPending);

    } catch (err: any) {
      console.error("Error fetching admin data:", err.message);
      setError("Failed to load admin data: " + err.message);
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [currentUserProfile, allQuests]); // Depend on allQuests

  useEffect(() => {
    if (!loadingAllQuests) { // Only fetch when allQuests are loaded
      fetchQuestsAndSubmissions();
    }
  }, [fetchQuestsAndSubmissions, loadingAllQuests]);

  const handleDeleteQuest = async (questId: string, isUserCreated: boolean) => {
    if (!isUserCreated) {
      toast.error("Cannot delete pre-defined quests.");
      return;
    }

    setLoading(true);
    try {
      // The removeQuest function in the context already handles the user_id check
      await removeQuest(questId);
      fetchQuestsAndSubmissions(); // Re-fetch to update UI
    } catch (err: any) {
      console.error("Error deleting quest:", err.message);
      toast.error("Failed to delete quest: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (submission: PendingImageSubmission, status: 'approved' | 'rejected') => {
    if (!currentUserProfile?.isAdmin) {
      toast.error("You do not have permission to verify quests.");
      return;
    }
    setLoading(true);
    try {
      await verifyQuestCompletion(
        submission.user_id,
        submission.quest_id,
        status,
        submission.xp_reward,
        submission.quest_title,
        submission.team_id,
        submission.is_predefined // Pass isPredefined
      );
      fetchQuestsAndSubmissions(); // Re-fetch to update UI
    } catch (err: any) {
      console.error("Error during verification:", err);
      toast.error("Failed to process verification.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingAllQuests) { // Include loadingAllQuests
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p className="text-lg text-center">{error}</p>
        <Button onClick={fetchQuestsAndSubmissions} variant="link" className="mt-2 text-red-600 dark:text-red-400">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading">Pending Image Submissions</h3>
      {pendingSubmissions.length === 0 ? (
        <p className="text-lg text-gray-500 dark:text-gray-400 text-center">No pending image submissions.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingSubmissions.map((submission) => (
            <Card key={submission.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={submission.user_avatar_url} alt={submission.user_name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{submission.user_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">submitted for "{submission.quest_title}"</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3"> {/* Changed to grid-cols-1 sm:grid-cols-2 */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Player's Submission:</p>
                  <img src={submission.completion_image_url} alt="Player Submission" className="w-full h-48 object-cover rounded-md border dark:border-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Creator's Reference:</p>
                  {submission.creator_reference_image_url ? (
                    <img src={submission.creator_reference_image_url} alt="Creator Reference" className="w-full h-48 object-cover rounded-md border dark:border-gray-700" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-center text-sm">
                      No reference image provided by creator.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-2"> {/* Changed to flex-col sm:flex-row */}
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                  onClick={() => handleVerify(submission, 'approved')}
                  disabled={loading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  onClick={() => handleVerify(submission, 'rejected')}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 font-heading">All Quests</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Title</TableHead>
              <TableHead className="text-left">Location</TableHead>
              <TableHead className="text-center">Difficulty</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quests.map((questEntry) => (
              <TableRow key={questEntry.id}>
                <TableCell className="font-medium text-gray-800 dark:text-gray-200">{questEntry.title}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{questEntry.location}</TableCell>
                <TableCell className="text-center text-gray-700 dark:text-gray-300">{questEntry.difficulty}</TableCell>
                <TableCell className="text-center">
                  {questEntry.is_user_created ? "User-Created" : "Pre-defined"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Link to={`/location-quests/${questEntry.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {questEntry.is_user_created && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={loading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-white font-heading">Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                              Are you sure you want to delete quest "{questEntry.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQuest(questEntry.id, questEntry.is_user_created)} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminQuestManagement;