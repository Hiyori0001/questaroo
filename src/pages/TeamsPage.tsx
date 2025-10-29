"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Trophy, PlusCircle, LogOut, Loader2, AlertCircle, UserPlus, Eye } from "lucide-react"; // Added Eye icon
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext"; // Import useUserProfile
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import CreateTeamForm from "@/components/CreateTeamForm";
import JoinTeamDialog from "@/components/JoinTeamDialog";
import TeamMembersDialog from "@/components/TeamMembersDialog"; // Import new component
import { Badge } from "@/components/ui/badge";

const TeamsPage = () => {
  const { teams, userTeam, loadingTeams, loadingUserTeam, leaveTeam } = useTeams();
  const { user, loading: loadingAuth } = useAuth();
  const { profile, loadingProfile } = useUserProfile(); // Get user profile for isAdmin check

  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isJoinTeamDialogOpen, setIsJoinTeamDialogOpen] = useState(false);
  const [isTeamMembersDialogOpen, setIsTeamMembersDialogOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<{ id: string; name: string } | null>(null);

  const handleLeaveTeam = async () => {
    await leaveTeam();
  };

  const handleViewMembers = (teamId: string, teamName: string) => {
    setSelectedTeamForMembers({ id: teamId, name: teamName });
    setIsTeamMembersDialogOpen(true);
  };

  if (loadingAuth || loadingTeams || loadingUserTeam || loadingProfile) { // Include loadingProfile
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading teams...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Please log in to view and manage teams.
        </p>
        <Button onClick={() => toast.info("Please use the login button in the navigation bar.")}>
          Go to Login
        </Button>
      </div>
    );
  }

  const isCurrentUserAdmin = profile?.isAdmin || false;

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <Users className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
            Teams & Community
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Join forces with other players and conquer challenges together in Questaroo!
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          {userTeam ? (
            <div className="mb-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-3 font-heading">Your Team: {userTeam.name}</h3>
              <p className="text-blue-700 dark:text-blue-300 mb-2">{userTeam.description}</p>
              <div className="flex justify-center items-center gap-4 text-blue-700 dark:text-blue-300 text-lg">
                <p className="flex items-center gap-1"><Users className="h-5 w-5" /> Members: {userTeam.member_count}</p>
                <p className="flex items-center gap-1"><Trophy className="h-5 w-5 text-yellow-500" /> Score: {userTeam.score}</p>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {(userTeam.created_by === user.id || isCurrentUserAdmin) && (
                  <Button
                    onClick={() => handleViewMembers(userTeam.id, userTeam.name)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Members
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
                      <LogOut className="h-4 w-4 mr-2" /> Leave Team
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-gray-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900 dark:text-white font-heading">Are you sure you want to leave your team?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                        You will no longer be part of "{userTeam.name}" and will lose team benefits.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLeaveTeam} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">Leave Team</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                You are not currently part of any team.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                      <PlusCircle className="h-4 w-4 mr-2" /> Create New Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white font-heading">Create Your Team</DialogTitle>
                      <CardDescription className="text-gray-700 dark:text-gray-300">
                        Give your team a name and a description.
                      </CardDescription>
                    </DialogHeader>
                    <CreateTeamForm onClose={() => setIsCreateTeamDialogOpen(false)} />
                  </DialogContent>
                </Dialog>

                <Dialog open={isJoinTeamDialogOpen} onOpenChange={setIsJoinTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-500 dark:hover:bg-gray-600">
                      <UserPlus className="h-4 w-4 mr-2" /> Join Existing Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white font-heading">Join a Team</DialogTitle>
                      <CardDescription className="text-gray-700 dark:text-gray-300">
                        Select a team from the list below to join.
                      </CardDescription>
                    </DialogHeader>
                    <JoinTeamDialog onClose={() => setIsJoinTeamDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading">All Teams</h2>
          {teams.length === 0 ? (
            <p className="text-lg text-gray-500 dark:text-gray-400">No teams available yet. Be the first to create one!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Team</TableHead>
                  <TableHead className="text-left">Description</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-center">Actions</TableHead> {/* Changed to Actions */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(team.name)}`} alt={team.name} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <Shield className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{team.name}</span>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{team.description}</TableCell>
                    <TableCell className="text-center text-gray-700 dark:text-gray-300">{team.member_count}</TableCell>
                    <TableCell className="text-right text-gray-700 dark:text-gray-300 flex items-center justify-end">
                      <Trophy className="h-4 w-4 text-yellow-500 mr-1" /> {team.score}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {!userTeam && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsJoinTeamDialogOpen(true);
                              toast.info(`Select "${team.name}" to join.`);
                            }}
                            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-gray-600"
                          >
                            Join
                          </Button>
                        )}
                        {userTeam && userTeam.id === team.id && (
                          <Badge className="bg-blue-500 dark:bg-blue-700 text-white">Your Team</Badge>
                        )}
                        {(team.created_by === user.id || isCurrentUserAdmin) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMembers(team.id, team.name)}
                            className="border-gray-400 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedTeamForMembers && (
        <TeamMembersDialog
          isOpen={isTeamMembersDialogOpen}
          onClose={() => setIsTeamMembersDialogOpen(false)}
          teamId={selectedTeamForMembers.id}
          teamName={selectedTeamForMembers.name}
        />
      )}
    </div>
  );
};

export default TeamsPage;