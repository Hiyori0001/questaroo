"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Shield, Trophy, Trash2, Eye, Hourglass } from "lucide-react"; // Added Hourglass
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTeams } from "@/contexts/TeamContext";
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
import TeamMembersDialog from "./TeamMembersDialog";
import AdminTeamJoinRequestsDialog from "./AdminTeamJoinRequestsDialog"; // New import
import { Badge } from "@/components/ui/badge"; // Import Badge

const AdminTeamManagement = () => {
  const { teams, loadingTeams, fetchTeams } = useTeams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isTeamMembersDialogOpen, setIsTeamMembersDialogOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<{ id: string; name: string } | null>(null);

  const [isAdminRequestsDialogOpen, setIsAdminRequestsDialogOpen] = useState(false);
  const [selectedTeamForRequests, setSelectedTeamForRequests] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!loadingTeams) {
      setLoading(false);
    }
  }, [loadingTeams]);

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    setLoading(true);
    setError(null);
    try {
      // First, remove team_id from all profiles associated with this team
      const { error: updateProfilesError } = await supabase
        .from('profiles')
        .update({ team_id: null })
        .eq('team_id', teamId);

      if (updateProfilesError) {
        throw updateProfilesError;
      }

      // Then, delete all join requests for this team
      const { error: deleteRequestsError } = await supabase
        .from('team_join_requests')
        .delete()
        .eq('team_id', teamId);

      if (deleteRequestsError) {
        console.error("Error deleting team join requests:", deleteRequestsError);
        // Don't throw, try to delete the team itself anyway
      }

      // Finally, delete the team itself
      const { error: deleteTeamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (deleteTeamError) {
        throw deleteTeamError;
      }

      toast.success(`Team "${teamName}" and its associated data deleted successfully.`);
      fetchTeams(); // Re-fetch all teams to update UI
    } catch (err: any) {
      console.error("Error deleting team:", err.message);
      setError("Failed to delete team: " + err.message);
      toast.error("Failed to delete team.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMembers = (teamId: string, teamName: string) => {
    setSelectedTeamForMembers({ id: teamId, name: teamName });
    setIsTeamMembersDialogOpen(true);
  };

  const handleViewRequests = (teamId: string, teamName: string) => {
    setSelectedTeamForRequests({ id: teamId, name: teamName });
    setIsAdminRequestsDialogOpen(true);
  };

  if (loadingTeams) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p className="text-lg text-center">{error}</p>
        <Button onClick={fetchTeams} variant="link" className="mt-2 text-red-600 dark:text-red-400">
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
            <TableHead className="text-left">Team Name</TableHead>
            <TableHead className="text-left">Description</TableHead>
            <TableHead className="text-center">Members</TableHead>
            <TableHead className="text-center">Requests</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">{team.name}</span>
              </TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{team.description}</TableCell>
              <TableCell className="text-center text-gray-700 dark:text-gray-300">{team.member_count}</TableCell>
              <TableCell className="text-center">
                {team.pending_request_count > 0 ? (
                  <Badge variant="destructive" className="bg-orange-500 dark:bg-orange-700 text-white">
                    {team.pending_request_count}
                  </Badge>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">0</span>
                )}
              </TableCell>
              <TableCell className="text-right text-gray-700 dark:text-gray-300 flex items-center justify-end">
                <Trophy className="h-4 w-4 text-yellow-500 mr-1" /> {team.score}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewMembers(team.id, team.name)}
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRequests(team.id, team.name)}
                    disabled={loading}
                    className="relative"
                  >
                    <Hourglass className="h-4 w-4" />
                    {team.pending_request_count > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                        {team.pending_request_count}
                      </Badge>
                    )}
                  </Button>
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
                          Are you sure you want to delete team "{team.name}"? This will also remove all members from this team and delete all associated join requests. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTeam(team.id, team.name)} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedTeamForMembers && (
        <TeamMembersDialog
          isOpen={isTeamMembersDialogOpen}
          onClose={() => setIsTeamMembersDialogOpen(false)}
          teamId={selectedTeamForMembers.id}
          teamName={selectedTeamForMembers.name}
        />
      )}

      {selectedTeamForRequests && (
        <AdminTeamJoinRequestsDialog
          isOpen={isAdminRequestsDialogOpen}
          onClose={() => setIsAdminRequestsDialogOpen(false)}
          teamId={selectedTeamForRequests.id}
          teamName={selectedTeamForRequests.name}
        />
      )}
    </div>
  );
};

export default AdminTeamManagement;