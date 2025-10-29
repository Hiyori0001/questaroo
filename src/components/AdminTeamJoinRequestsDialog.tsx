"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, X, Loader2, AlertCircle, User as UserIcon, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeams } from "@/contexts/TeamContext";
import { toast } from "sonner";

interface TeamJoinRequest {
  id: string;
  user_id: string;
  team_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface AdminTeamJoinRequestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const AdminTeamJoinRequestsDialog: React.FC<AdminTeamJoinRequestsDialogProps> = ({ isOpen, onClose, teamId, teamName }) => {
  const { fetchTeamJoinRequests, acceptTeamJoinRequest, rejectTeamJoinRequest } = useTeams();
  const [requests, setRequests] = useState<TeamJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRequests = await fetchTeamJoinRequests(teamId);
      setRequests(fetchedRequests);
    } catch (err) {
      console.error("Failed to fetch team join requests:", err);
      setError("Failed to load team join requests. You might not have permission.");
    } finally {
      setLoading(false);
    }
  }, [teamId, fetchTeamJoinRequests]);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, loadRequests]);

  const handleAccept = async (requestId: string, userId: string) => {
    await acceptTeamJoinRequest(requestId, userId, teamId);
    loadRequests(); // Refresh the list after action
  };

  const handleReject = async (requestId: string) => {
    await rejectTeamJoinRequest(requestId);
    loadRequests(); // Refresh the list after action
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setRequests([]);
        setError(null);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800">
        <DialogHeader className="flex flex-col items-center">
          <Hourglass className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-3" />
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Join Requests for "{teamName}"</DialogTitle>
          <DialogDescription className="text-md text-gray-700 dark:text-gray-300 text-center">
            {loading ? "Loading requests..." : error ? error : "Review pending requests to join your team."}
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
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No pending join requests for this team.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">User</TableHead><TableHead className="text-center">Requested At</TableHead><TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.profiles.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(request.user_id)}`} alt={`${request.profiles.first_name} ${request.profiles.last_name}`} />
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {`${request.profiles.first_name || ''} ${request.profiles.last_name || ''}`.trim() || "Anonymous"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-gray-700 dark:text-gray-300">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col sm:flex-row justify-center gap-2">
                          <Button size="sm" onClick={() => handleAccept(request.id, request.user_id)} disabled={loading}>
                            <CheckCircle2 className="h-4 w-4" /> Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)} disabled={loading}>
                            <XCircle className="h-4 w-4" /> Reject
                          </Button>
                        </div>
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

export default AdminTeamJoinRequestsDialog;