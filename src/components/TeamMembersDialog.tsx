"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, X, Loader2, AlertCircle, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeams } from "@/contexts/TeamContext";

interface TeamMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const TeamMembersDialog: React.FC<TeamMembersDialogProps> = ({ isOpen, onClose, teamId, teamName }) => {
  const { fetchTeamMembers } = useTeams();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && teamId) {
      const loadMembers = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedMembers = await fetchTeamMembers(teamId);
          setMembers(fetchedMembers);
        } catch (err) {
          console.error("Failed to fetch team members:", err);
          setError("Failed to load team members. You might not have permission.");
        } finally {
          setLoading(false);
        }
      };
      loadMembers();
    }
  }, [isOpen, teamId, fetchTeamMembers]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setMembers([]); // Clear members when dialog closes
        setError(null);
      }
    }}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
        <DialogHeader className="flex flex-col items-center">
          <Users className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Members of {teamName}</DialogTitle>
          <DialogDescription className="text-md text-gray-700 dark:text-gray-300 text-center">
            {loading ? "Loading members..." : error ? error : "Here are the members of this team."}
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
          ) : members.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No members found or you don't have permission to view them.</p>
          ) : (
            <div className="overflow-x-auto"> {/* Added overflow-x-auto */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Player</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {`${member.first_name} ${member.last_name}`.trim()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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

export default TeamMembersDialog;