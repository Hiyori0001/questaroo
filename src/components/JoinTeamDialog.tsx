"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Trophy, Shield, X, Loader2, AlertCircle, Hourglass } from "lucide-react"; // Added Hourglass
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeams } from "@/contexts/TeamContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"; // Import Badge

interface JoinTeamDialogProps {
  onClose: () => void;
}

const JoinTeamDialog: React.FC<JoinTeamDialogProps> = ({ onClose }) => {
  const { teams, userTeam, pendingUserTeamRequest, loadingTeams, sendJoinTeamRequest } = useTeams();

  const handleSendJoinRequest = async (teamId: string) => {
    await sendJoinTeamRequest(teamId);
    // Keep dialog open for now, user can close manually or it can close on success
    // onClose(); 
  };

  if (loadingTeams) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-300">Loading teams...</p>
      </div>
    );
  }

  const availableTeams = teams.filter(team => !userTeam || team.id !== userTeam.id);

  return (
    <div className="py-4">
      {availableTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-lg text-center">No other teams available to join.</p>
          {userTeam && <p className="text-sm mt-2">You are already in a team.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Team</TableHead><TableHead className="text-center">Members</TableHead><TableHead className="text-right">Score</TableHead><TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableTeams.map((team) => {
                const hasPendingRequestToThisTeam = pendingUserTeamRequest?.team_id === team.id;
                return (
                  <TableRow key={team.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(team.name)}`} alt={team.name} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <Shield className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{team.name}</span>
                    </TableCell>
                    <TableCell className="text-center text-gray-700 dark:text-gray-300">{team.member_count}</TableCell>
                    <TableCell className="text-right text-gray-700 dark:text-gray-300 flex items-center justify-end">
                      <Trophy className="h-4 w-4 text-yellow-500 mr-1" /> {team.score}
                    </TableCell>
                    <TableCell className="text-center">
                      {hasPendingRequestToThisTeam ? (
                        <Badge variant="outline" className="border-orange-500 text-orange-500 dark:border-orange-700 dark:text-orange-300 flex items-center justify-center gap-1">
                          <Hourglass className="h-4 w-4" /> Request Sent
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendJoinRequest(team.id)}
                          disabled={!!userTeam || !!pendingUserTeamRequest} // Disable if user is already in a team or has a pending request
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-gray-600"
                        >
                          Join
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
            <X className="h-4 w-4 mr-2" /> Close
        </Button>
      </div>
    </div>
  );
};

export default JoinTeamDialog;