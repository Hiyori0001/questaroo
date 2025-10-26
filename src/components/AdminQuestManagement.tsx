"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, MapPin, Trash2, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { allDummyQuests, Quest } from "@/data/quests";
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

interface AdminQuest extends Quest {
  is_user_created: boolean;
}

const AdminQuestManagement = () => {
  const [quests, setQuests] = useState<AdminQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('user_quests')
        .select('*');

      if (dbError) {
        throw dbError;
      }

      const userCreatedQuests: AdminQuest[] = data.map(dbQuest => ({
        id: dbQuest.id,
        title: dbQuest.title,
        description: dbQuest.description,
        location: dbQuest.location,
        difficulty: dbQuest.difficulty as Quest["difficulty"],
        reward: dbQuest.reward,
        timeEstimate: dbQuest.time_estimate,
        timeLimit: dbQuest.time_limit || undefined,
        completionTask: dbQuest.completion_task || undefined,
        qrCode: dbQuest.qr_code || undefined,
        user_id: dbQuest.user_id,
        latitude: dbQuest.latitude || undefined,
        longitude: dbQuest.longitude || undefined,
        is_user_created: true,
      }));

      const dummyQuestsWithFlag: AdminQuest[] = allDummyQuests.map(dq => ({
        ...dq,
        is_user_created: false,
      }));

      setQuests([...dummyQuestsWithFlag, ...userCreatedQuests]);
    } catch (err: any) {
      console.error("Error fetching quests:", err.message);
      setError("Failed to load quests: " + err.message);
      toast.error("Failed to load quests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleDeleteQuest = async (questId: string, isUserCreated: boolean) => {
    if (!isUserCreated) {
      toast.error("Cannot delete pre-defined quests.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_quests')
        .delete()
        .eq('id', questId);

      if (error) {
        throw error;
      }

      toast.success(`Quest ${questId} deleted successfully.`);
      fetchQuests(); // Re-fetch to update UI
    } catch (err: any) {
      console.error("Error deleting quest:", err.message);
      toast.error("Failed to delete quest: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading quests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p className="text-lg text-center">{error}</p>
        <Button onClick={fetchQuests} variant="link" className="mt-2 text-red-600 dark:text-red-400">
          Retry
        </Button>
      </div>
    );
  }

  return (
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
                          <AlertDialogTitle className="text-gray-900 dark:text-white">Confirm Deletion</AlertDialogTitle>
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
  );
};

export default AdminQuestManagement;