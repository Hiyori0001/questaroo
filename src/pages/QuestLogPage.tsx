"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListTodo, Loader2, AlertCircle, CheckCircle2, PlayCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { allDummyQuests, Quest } from "@/data/quests";
import { useAllUserCreatedQuests } from "@/contexts/AllUserCreatedQuestsContext"; // Updated import
import { Badge } from "@/components/ui/badge";

interface UserQuestProgress {
  quest_id: string;
  status: 'started' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
}

interface QuestLogEntry extends Quest {
  status: 'started' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
}

const QuestLogPage = () => {
  const { user, loading: loadingAuth } = useAuth();
  const { allUserCreatedQuests, loadingAllUserCreatedQuests } = useAllUserCreatedQuests(); // Updated hook and variable
  const navigate = useNavigate();
  const [questLog, setQuestLog] = useState<QuestLogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/auth");
      toast.info("Please log in to view your quest log.");
      return;
    }

    const fetchQuestLog = async () => {
      if (!user) return;

      setLoadingLog(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_quest_progress')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error("Error fetching quest log:", fetchError);
        setError("Failed to load your quest log. Please try again.");
        toast.error("Failed to load quest log.");
        setQuestLog([]);
      } else {
        const allAvailableQuests = [...allDummyQuests, ...allUserCreatedQuests]; // Updated variable
        const logEntries: QuestLogEntry[] = data.map((progress: UserQuestProgress) => {
          const questDetails = allAvailableQuests.find(q => q.id === progress.quest_id);
          if (questDetails) {
            return {
              ...questDetails,
              status: progress.status,
              started_at: progress.started_at,
              completed_at: progress.completed_at,
            };
          }
          // Fallback for quests that might have been deleted or are no longer available
          return {
            id: progress.quest_id,
            title: "Unknown Quest",
            description: "This quest is no longer available.",
            location: "N/A",
            difficulty: "Easy",
            reward: "N/A",
            timeEstimate: "N/A",
            status: progress.status,
            started_at: progress.started_at,
            completed_at: progress.completed_at,
          };
        });
        setQuestLog(logEntries);
      }
      setLoadingLog(false);
    };

    if (user && !loadingAllUserCreatedQuests) { // Ensure allUserCreatedQuests are loaded before fetching log
      fetchQuestLog();
    }
  }, [user, loadingAuth, navigate, allUserCreatedQuests, loadingAllUserCreatedQuests]); // Updated dependency

  if (loadingAuth || loadingLog || loadingAllUserCreatedQuests) { // Updated loading state
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading quest log...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <ListTodo className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
            Your Quest Log
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Track your progress on all your Questaroo adventures!
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          {questLog.length === 0 ? (
            <p className="text-lg text-gray-500 dark:text-gray-400 text-center mt-8">
              You haven't started any quests yet. Go find an adventure!
            </p>
          ) : (
            <div className="overflow-x-auto"> {/* Added overflow-x-auto */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Quest Title</TableHead>
                    <TableHead className="text-left">Location</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Started On</TableHead>
                    <TableHead className="text-center">Completed On</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                        {entry.title}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {entry.location}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.status === 'completed' && (
                          <Badge className="bg-green-500 dark:bg-green-700 text-white flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Completed
                          </Badge>
                        )}
                        {entry.status === 'started' && (
                          <Badge variant="outline" className="border-blue-500 text-blue-500 dark:border-blue-700 dark:text-blue-300 flex items-center justify-center gap-1">
                            <PlayCircle className="h-4 w-4" /> Started
                          </Badge>
                        )}
                        {entry.status === 'failed' && (
                          <Badge className="bg-red-500 dark:bg-red-700 text-white flex items-center justify-center gap-1">
                            <XCircle className="h-4 w-4" /> Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-gray-700 dark:text-gray-300">
                        {new Date(entry.started_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center text-gray-700 dark:text-gray-300">
                        {entry.completed_at ? new Date(entry.completed_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/location-quests/${entry.id}`}>
                          <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-gray-600">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestLogPage;