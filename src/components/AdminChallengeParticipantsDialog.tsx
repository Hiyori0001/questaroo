"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, X, Loader2, AlertCircle, User as UserIcon, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/UserProfileContext"; // Import useUserProfile

interface CommunityChallenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_type: string;
  status: string;
  completion_criteria: string | null;
}

interface Participant {
  id: string; // user_challenge_participation ID
  user_id: string;
  challenge_id: string;
  joined_at: string;
  status: 'participating' | 'completed' | 'withdrawn' | 'failed';
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    experience: number; // To show current XP
    team_id: string | null; // To pass to reward function
  };
}

interface AdminChallengeParticipantsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: CommunityChallenge;
  onChallengeUpdated: () => void; // Callback to refresh parent component
}

const AdminChallengeParticipantsDialog: React.FC<AdminChallengeParticipantsDialogProps> = ({ isOpen, onClose, challenge, onChallengeUpdated }) => {
  const { grantChallengeReward } = useUserProfile(); // Use the new function from UserProfileContext
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('user_challenge_participation')
        .select(`
          id,
          user_id,
          challenge_id,
          joined_at,
          status,
          profiles!user_id(id, first_name, last_name, avatar_url, experience, team_id)
        `)
        .eq('challenge_id', challenge.id);

      if (fetchError) {
        throw fetchError;
      }

      setParticipants(data as Participant[]);
    } catch (err: any) {
      console.error("Error fetching challenge participants:", err.message);
      setError("Failed to load participants.");
      toast.error("Failed to load participants.");
    } finally {
      setLoading(false);
    }
  }, [challenge.id]);

  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
    }
  }, [isOpen, fetchParticipants]);

  const handleApproveCompletion = async (participant: Participant) => {
    setLoading(true);
    try {
      // Determine XP reward based on challenge type (for now, a fixed amount for 'Team XP' or a placeholder)
      // In a real app, this would be more dynamic based on challenge difficulty/type
      const xpReward = challenge.reward_type === "Team XP" ? 500 : 0; // Example XP reward

      await grantChallengeReward(
        participant.user_id,
        challenge.id,
        'completed', // status
        challenge.reward_type,
        xpReward,
        challenge.name,
        participant.profiles.team_id // Pass team_id
      );
      toast.success(`Challenge completion approved for ${participant.profiles.first_name || 'user'}!`);
      fetchParticipants(); // Refresh participants list
      onChallengeUpdated(); // Notify parent to refresh challenges (e.g., if status changed)
    } catch (err: any) {
      console.error("Error approving challenge completion:", err.message);
      toast.error("Failed to approve challenge completion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCompletion = async (participant: Participant) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('user_challenge_participation')
        .update({ status: 'failed' }) // Or 'withdrawn' or 'rejected'
        .eq('id', participant.id);

      if (updateError) {
        throw updateError;
      }
      toast.info(`Challenge completion rejected for ${participant.profiles.first_name || 'user'}.`);
      fetchParticipants(); // Refresh participants list
      onChallengeUpdated();
    } catch (err: any) {
      console.error("Error rejecting challenge completion:", err.message);
      toast.error("Failed to reject challenge completion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setParticipants([]);
        setError(null);
      }
    }}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-gray-800">
        <DialogHeader className="flex flex-col items-center">
          <Users className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Participants for "{challenge.name}"</DialogTitle>
          <DialogDescription className="text-md text-gray-700 dark:text-gray-300 text-center">
            Review and manage the completion status of users participating in this challenge.
            <p className="mt-2 font-semibold">Objective: {challenge.completion_criteria || "No specific criteria defined."}</p>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 text-red-600 dark:text-red-400">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-lg text-center">{error}</p>
            </div>
          ) : participants.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No users have joined this challenge yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Player</TableHead>
                  <TableHead className="text-center">Joined At</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.profiles.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(participant.user_id)}`} alt={`${participant.profiles.first_name} ${participant.profiles.last_name}`} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {`${participant.profiles.first_name || ''} ${participant.profiles.last_name || ''}`.trim() || "Anonymous"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-gray-700 dark:text-gray-300">
                      {new Date(participant.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {participant.status === 'completed' && <span className="text-green-600 dark:text-green-400 flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4" /> Completed</span>}
                      {participant.status === 'participating' && <span className="text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1"><Users className="h-4 w-4" /> Participating</span>}
                      {participant.status === 'failed' && <span className="text-red-600 dark:text-red-400 flex items-center justify-center gap-1"><XCircle className="h-4 w-4" /> Failed</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {participant.status === 'participating' && (
                          <>
                            <Button size="sm" onClick={() => handleApproveCompletion(participant)} disabled={loading}>
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectCompletion(participant)} disabled={loading}>
                              <XCircle className="h-4 w-4" /> Reject
                            </Button>
                          </>
                        )}
                        {(participant.status === 'completed' || participant.status === 'failed') && (
                          <Button size="sm" variant="outline" disabled>
                            Reviewed
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
            <X className="h-4 w-4 mr-2" /> Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminChallengeParticipantsDialog;