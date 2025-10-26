"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, User as UserIcon, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth to get current user ID

interface AdminProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string; // Assuming email is always available from auth.users
  experience: number;
  is_admin: boolean;
  team_id: string | null;
  team_name: string | null; // To display team name directly
}

// IMPORTANT: Replace this with the actual Supabase user ID (UUID) of your developer account.
// This user will be considered the "Head Admin" with full control.
const DEVELOPER_USER_ID = "6187dac6-1eac-4d78-ab27-61e31c334a05"; 

const AdminUserManagement = () => {
  const { user: currentUser } = useAuth(); // Get the currently logged-in user
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          experience,
          is_admin,
          team_id
        `);

      if (profilesError) {
        throw profilesError;
      }

      // 2. Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name');

      if (teamsError) {
        throw teamsError;
      }

      // Create a map for quick team name lookup
      const teamNameMap = new Map(teamsData.map(team => [team.id, team.name]));

      // 3. Invoke Edge Function to fetch auth.users (requires service_role key)
      const { data: authUsersResponse, error: edgeFunctionError } = await supabase.functions.invoke('list-users');

      if (edgeFunctionError) {
        throw new Error(edgeFunctionError.message);
      }
      
      // The Edge Function returns an array of user objects
      const authUsers: any[] = authUsersResponse as any[]; 
      const authUsersMap = new Map(authUsers.map(u => [u.id, u.email]));

      // 4. Combine data
      const formattedUsers: AdminProfile[] = profilesData.map(profile => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        email: authUsersMap.get(profile.id) || "N/A", // Get email from auth.users
        experience: profile.experience || 0,
        is_admin: profile.is_admin || false,
        team_id: profile.team_id,
        team_name: profile.team_id ? teamNameMap.get(profile.team_id) || null : null,
      }));
      setUsers(formattedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      setError("Failed to load users: " + err.message);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleAdmin = async (targetUserId: string, currentAdminStatus: boolean) => {
    if (!currentUser) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    // Only the Head Admin (DEVELOPER_USER_ID) can toggle admin status
    if (currentUser.id !== DEVELOPER_USER_ID) {
      toast.error("Only the Head Administrator can change admin privileges.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentAdminStatus })
      .eq('id', targetUserId);

    if (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Failed to update admin status.");
    } else {
      toast.success(`Admin status for user ${targetUserId} updated.`);
      fetchUsers(); // Re-fetch to update UI
    }
    setLoading(false);
  };

  const handleDeleteUser = async (targetUserId: string, targetUserIsAdmin: boolean) => {
    if (!currentUser) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    // If current user is not the Head Admin
    if (currentUser.id !== DEVELOPER_USER_ID) {
      // Regular admins cannot delete other admins
      if (targetUserIsAdmin) {
        toast.error("You cannot delete another administrator.");
        return;
      }
      // Regular admins can delete non-admin users
    }
    // Head Admin can delete anyone

    setLoading(true);
    try {
      // Delete user from auth.users, which should cascade to profiles table
      const { error: authError } = await supabase.auth.admin.deleteUser(targetUserId);

      if (authError) {
        throw authError;
      }

      toast.success(`User ${targetUserId} deleted successfully.`);
      fetchUsers(); // Re-fetch to update UI
    } catch (err: any) {
      console.error("Error deleting user:", err.message);
      toast.error("Failed to delete user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p className="text-lg text-center">{error}</p>
        <Button onClick={fetchUsers} variant="link" className="mt-2 text-red-600 dark:text-red-400">
          Retry
        </Button>
      </div>
    );
  }

  const isCurrentUserHeadAdmin = currentUser?.id === DEVELOPER_USER_ID;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">User</TableHead>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-right">XP</TableHead>
            <TableHead className="text-center">Team</TableHead>
            <TableHead className="text-center">Admin</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((userEntry) => (
            <TableRow key={userEntry.id}>
              <TableCell className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userEntry.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(userEntry.id)}`} alt={`${userEntry.first_name} ${userEntry.last_name}`} />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {`${userEntry.first_name || ''} ${userEntry.last_name || ''}`.trim() || "Anonymous"}
                </span>
              </TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{userEntry.email}</TableCell>
              <TableCell className="text-right text-gray-700 dark:text-gray-300">{userEntry.experience}</TableCell>
              <TableCell className="text-center text-gray-700 dark:text-gray-300">
                {userEntry.team_name || "N/A"}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <Switch
                    id={`admin-switch-${userEntry.id}`}
                    checked={userEntry.is_admin}
                    onCheckedChange={() => handleToggleAdmin(userEntry.id, userEntry.is_admin)}
                    // Only Head Admin can toggle admin status
                    disabled={loading || !isCurrentUserHeadAdmin}
                  />
                  <Label htmlFor={`admin-switch-${userEntry.id}`} className="sr-only">Toggle Admin Status</Label>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      disabled={
                        loading || 
                        (!isCurrentUserHeadAdmin && userEntry.is_admin) // Regular admin cannot delete other admins
                      } 
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-gray-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900 dark:text-white">Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                        Are you sure you want to delete user "{userEntry.email}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteUser(userEntry.id, userEntry.is_admin)} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUserManagement;