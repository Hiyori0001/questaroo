"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Team {
  id: string;
  name: string;
  description: string;
  created_by: string; // User ID of the creator
  score: number;
  created_at: string;
  member_count: number;
  pending_request_count: number; // New: Count of pending join requests
}

interface TeamMemberProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface TeamJoinRequest {
  id: string;
  user_id: string;
  team_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles?: { // Profile of the user who sent the request (made optional)
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface TeamContextType {
  teams: Team[];
  userTeam: Team | null;
  pendingUserTeamRequest: TeamJoinRequest | null; // New: User's own pending request
  loadingTeams: boolean;
  loadingUserTeam: boolean;
  loadingPendingUserTeamRequest: boolean; // New: Loading state for user's pending request
  fetchTeams: () => Promise<void>;
  createTeam: (name: string, description: string) => Promise<void>;
  sendJoinTeamRequest: (teamId: string) => Promise<void>; // Renamed from joinTeam
  leaveTeam: () => Promise<void>;
  addTeamScore: (teamId: string, scoreToAdd: number) => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<TeamMemberProfile[]>;
  fetchTeamJoinRequests: (teamId: string) => Promise<TeamJoinRequest[]>; // New: Fetch requests for a team
  acceptTeamJoinRequest: (requestId: string, userId: string, teamId: string) => Promise<void>; // New: Accept request
  rejectTeamJoinRequest: (requestId: string) => Promise<void>; // New: Reject request
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingAuth } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [pendingUserTeamRequest, setPendingUserTeamRequest] = useState<TeamJoinRequest | null>(null); // New state
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingUserTeam, setLoadingUserTeam] = useState(true);
  const [loadingPendingUserTeamRequest, setLoadingPendingUserTeamRequest] = useState(true); // New loading state

  // Fetch all teams and their member/pending request counts
  const fetchTeams = useCallback(async () => {
    setLoadingTeams(true);
    console.log("TeamContext: Starting fetchTeams...");
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('score', { ascending: false });

    if (teamsError) {
      console.error("TeamContext: Error fetching all teams:", teamsError.message, teamsError.details);
      toast.error("Failed to load teams.");
      setTeams([]);
      setLoadingTeams(false);
      return;
    }

    console.log("TeamContext: Raw teams data from Supabase:", teamsData);

    const teamsWithCounts: Team[] = [];
    for (const team of teamsData) {
      // Fetch member count
      const { count: memberCount, error: memberCountError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('team_id', team.id);

      if (memberCountError) {
        console.error(`TeamContext: Error fetching member count for team ${team.id}:`, memberCountError.message, memberCountError.details);
      }

      // Fetch pending request count
      const { count: pendingRequestCount, error: pendingRequestCountError } = await supabase
        .from('team_join_requests')
        .select('id', { count: 'exact' })
        .eq('team_id', team.id)
        .eq('status', 'pending');

      if (pendingRequestCountError) {
        console.error(`TeamContext: Error fetching pending request count for team ${team.id}:`, pendingRequestCountError.message, pendingRequestCountError.details);
      }

      teamsWithCounts.push({
        id: team.id,
        name: team.name,
        description: team.description,
        created_by: team.created_by,
        score: team.score,
        created_at: team.created_at,
        member_count: memberCount || 0,
        pending_request_count: pendingRequestCount || 0,
      });
    }

    setTeams(teamsWithCounts);
    console.log("TeamContext: Formatted teams for state:", teamsWithCounts);
    setLoadingTeams(false);
    console.log("TeamContext: Finished fetchTeams.");
  }, []);

  // Fetch the current user's team
  const fetchUserTeam = useCallback(async (userId: string) => {
    setLoadingUserTeam(true);
    console.log("TeamContext: Fetching user team for userId:", userId);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("TeamContext: Error fetching user profile for team_id:", profileError.message, profileError.details);
      toast.error("Failed to load your team status.");
      setUserTeam(null);
    } else if (profileData?.team_id) {
      console.log("TeamContext: User profile has team_id:", profileData.team_id);
      // Fetch team details
      const { data: teamDetails, error: teamDetailsError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', profileData.team_id)
        .single();

      if (teamDetailsError) {
        console.error("TeamContext: Error fetching user's team details:", teamDetailsError.message, teamDetailsError.details);
        toast.error("Failed to load your team details.");
        setUserTeam(null);
        setLoadingUserTeam(false);
        return;
      }

      // Fetch member count for this specific team
      const { count: memberCount, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('team_id', teamDetails.id);

      // Fetch pending request count for this specific team
      const { count: pendingRequestCount, error: pendingRequestCountError } = await supabase
        .from('team_join_requests')
        .select('id', { count: 'exact' })
        .eq('team_id', teamDetails.id)
        .eq('status', 'pending');

      if (countError || pendingRequestCountError) {
        console.error(`TeamContext: Error fetching counts for user's team ${teamDetails.id}:`, countError?.message, pendingRequestCountError?.message);
      }

      setUserTeam({
        id: teamDetails.id,
        name: teamDetails.name,
        description: teamDetails.description,
        created_by: teamDetails.created_by,
        score: teamDetails.score,
        created_at: teamDetails.created_at,
        member_count: memberCount || 0,
        pending_request_count: pendingRequestCount || 0,
      });
      console.log("TeamContext: User's team data set:", teamDetails);
    } else {
      console.log("TeamContext: User profile has no team_id or profile not found.");
      setUserTeam(null);
    }
    setLoadingUserTeam(false);
  }, []);

  // Fetch the current user's pending team request
  const fetchPendingUserTeamRequest = useCallback(async (userId: string) => {
    setLoadingPendingUserTeamRequest(true);
    console.log("TeamContext: Fetching pending user team request for userId:", userId);
    const { data, error } = await supabase
      .from('team_join_requests')
      .select('id, user_id, team_id, status, created_at') // Explicitly select columns
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("TeamContext: Error fetching pending user team request:", error.message, error.details);
      setPendingUserTeamRequest(null);
    } else if (data) {
      setPendingUserTeamRequest({
        id: data.id,
        user_id: data.user_id,
        team_id: data.team_id,
        status: data.status,
        created_at: data.created_at,
        // profiles is not selected, so it will be undefined, which the interface now allows.
      });
      console.log("TeamContext: User has pending team request:", data);
    } else {
      setPendingUserTeamRequest(null);
      console.log("TeamContext: User has no pending team request.");
    }
    setLoadingPendingUserTeamRequest(false);
  }, []);

  // New function to fetch members of a specific team
  const fetchTeamMembers = useCallback(async (teamId: string): Promise<TeamMemberProfile[]> => {
    if (!user) {
      toast.error("You must be logged in to view team members.");
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('team_id', teamId);

    if (error) {
      console.error("TeamContext: Error fetching team members:", error.message, error.details);
      toast.error("Failed to load team members.");
      return [];
    }

    return data.map(profile => ({
      id: profile.id,
      first_name: profile.first_name || "Adventure",
      last_name: profile.last_name || "Seeker",
      avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(profile.id)}`,
    }));
  }, [user]);

  // New function to fetch join requests for a specific team (for team creators/admins)
  const fetchTeamJoinRequests = useCallback(async (teamId: string): Promise<TeamJoinRequest[]> => {
    if (!user) {
      toast.error("You must be logged in to view join requests.");
      return [];
    }

    const { data, error } = await supabase
      .from('team_join_requests')
      .select(`
        id,
        user_id,
        team_id,
        status,
        created_at,
        profiles!user_id(id, first_name, last_name, avatar_url)
      `)
      .eq('team_id', teamId)
      .eq('status', 'pending');

    if (error) {
      console.error("TeamContext: Error fetching team join requests:", error.message, error.details);
      toast.error("Failed to load team join requests.");
      return [];
    }

    return data.map((req: any) => ({
      id: req.id,
      user_id: req.user_id,
      team_id: req.team_id,
      status: req.status,
      created_at: req.created_at,
      profiles: {
        id: req.profiles.id,
        first_name: req.profiles.first_name || "Adventure",
        last_name: req.profiles.last_name || "Seeker",
        avatar_url: req.profiles.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(req.profiles.id)}`,
      },
    }));
  }, [user]);

  // Renamed from joinTeam to sendJoinTeamRequest
  const sendJoinTeamRequest = useCallback(async (teamId: string) => {
    if (!user) {
      toast.error("You must be logged in to send a team join request.");
      return;
    }
    if (userTeam) {
      toast.error("You are already part of a team. Please leave your current team first.");
      return;
    }
    if (pendingUserTeamRequest) {
      toast.info("You already have a pending team join request.");
      return;
    }

    const { error } = await supabase
      .from('team_join_requests')
      .insert({ user_id: user.id, team_id: teamId, status: 'pending' });

    if (error) {
      console.error("TeamContext: Error sending join request:", error.message, error.details);
      if (error.code === '23505') { // unique_violation
        toast.info("You have already sent a join request to this team.");
      } else {
        toast.error("Failed to send team join request.");
      }
    } else {
      toast.success("Team join request sent! Awaiting approval from team leader.");
      fetchPendingUserTeamRequest(user.id); // Refresh user's pending request status
      fetchTeams(); // Refresh all teams to update pending request counts
    }
  }, [user, userTeam, pendingUserTeamRequest, fetchPendingUserTeamRequest, fetchTeams]);

  const acceptTeamJoinRequest = useCallback(async (requestId: string, targetUserId: string, teamId: string) => {
    if (!user) {
      toast.error("You must be logged in to accept join requests.");
      return;
    }

    // 1. Update the request status to 'accepted'
    const { error: updateRequestError } = await supabase
      .from('team_join_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateRequestError) {
      console.error("TeamContext: Error accepting join request:", updateRequestError.message, updateRequestError.details);
      toast.error("Failed to accept team join request.");
      return;
    }

    // 2. Update the user's profile to assign them to the team
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ team_id: teamId })
      .eq('id', targetUserId);

    if (updateProfileError) {
      console.error("TeamContext: Error assigning user to team:", updateProfileError.message, updateProfileError.details);
      toast.error("Failed to assign user to team.");
      // Consider reverting the request status if profile update fails
      return;
    }

    toast.success("Team join request accepted and user added to team!");
    fetchTeams(); // Refresh all teams to update member counts
    fetchUserTeam(targetUserId); // Refresh the target user's team status (if they are the current user)
    if (user.id === targetUserId) {
      fetchPendingUserTeamRequest(user.id); // Clear current user's pending request if it was theirs
    }
  }, [user, fetchTeams, fetchUserTeam, fetchPendingUserTeamRequest]);

  const rejectTeamJoinRequest = useCallback(async (requestId: string) => {
    if (!user) {
      toast.error("You must be logged in to reject join requests.");
      return;
    }

    const { error } = await supabase
      .from('team_join_requests')
      .update({ status: 'rejected' }) // Or delete the request
      .eq('id', requestId);

    if (error) {
      console.error("TeamContext: Error rejecting join request:", error.message, error.details);
      toast.error("Failed to reject team join request.");
    } else {
      toast.info("Team join request rejected.");
      fetchTeams(); // Refresh all teams to update pending request counts
    }
  }, [user, fetchTeams]);

  const createTeam = useCallback(async (name: string, description: string) => {
    if (!user) {
      toast.error("You must be logged in to create a team.");
      return;
    }
    if (userTeam) {
      toast.error("You are already part of a team. Please leave your current team first.");
      return;
    }
    if (pendingUserTeamRequest) {
      toast.info("You have a pending team join request. Please resolve it first.");
      return;
    }

    const { data, error } = await supabase
      .from('teams')
      .insert({ name, description, created_by: user.id })
      .select()
      .single();

    if (error) {
      console.error("TeamContext: Error creating team:", error.message, error.details);
      toast.error(`Failed to create team "${name}". ${error.message}`);
    } else {
      // Automatically add the creator to the team
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ team_id: data.id })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error("TeamContext: Error adding creator to team:", profileUpdateError.message, profileUpdateError.details);
        toast.error("Team created, but failed to add you to it. Please try joining manually.");
      } else {
        toast.success(`Team "${name}" created successfully and you've joined!`);
        fetchUserTeam(user.id); // Refresh user's team status
        fetchTeams(); // Refresh all teams
      }
    }
  }, [user, userTeam, pendingUserTeamRequest, fetchUserTeam, fetchTeams]);

  const leaveTeam = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to leave a team.");
      return;
    }
    if (!userTeam) {
      toast.info("You are not currently part of any team.");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ team_id: null })
      .eq('id', user.id);

    if (error) {
      console.error("TeamContext: Error leaving team:", error.message, error.details);
      toast.error("Failed to leave team.");
    } else {
      toast.success("Successfully left the team.");
      setUserTeam(null); // Clear user's team
      fetchTeams(); // Refresh all teams to update member counts
    }
  }, [user, userTeam, fetchTeams]);

  const addTeamScore = useCallback(async (teamId: string, scoreToAdd: number) => {
    if (!user) {
      toast.error("You must be logged in to update team score.");
      return;
    }

    const { data: currentTeam, error: fetchError } = await supabase
      .from('teams')
      .select('score')
      .eq('id', teamId)
      .single();

    if (fetchError || !currentTeam) {
      console.error("TeamContext: Error fetching current team score for update:", fetchError.message, fetchError.details);
      toast.error("Failed to update team score: Could not retrieve current score.");
      return;
    }

    const newScore = currentTeam.score + scoreToAdd;

    const { error } = await supabase
      .from('teams')
      .update({ score: newScore })
      .eq('id', teamId);

    if (error) {
      console.error("TeamContext: Error adding team score:", error.message, error.details);
      toast.error("Failed to update team score.");
    } else {
      toast.info(`Team score updated! +${scoreToAdd} points.`);
      fetchTeams(); // Refresh all teams to show updated score
      if (userTeam && userTeam.id === teamId) {
        setUserTeam(prev => prev ? { ...prev, score: newScore } : null); // Update user's team state if it's their team
      }
    }
  }, [user, userTeam, fetchTeams]);

  useEffect(() => {
    if (loadingAuth) {
      setLoadingTeams(true);
      setLoadingUserTeam(true);
      setLoadingPendingUserTeamRequest(true);
      return;
    }

    fetchTeams();

    if (user) {
      fetchUserTeam(user.id);
      fetchPendingUserTeamRequest(user.id);
    } else {
      setUserTeam(null);
      setPendingUserTeamRequest(null);
      setLoadingUserTeam(false);
      setLoadingPendingUserTeamRequest(false);
    }
  }, [user, loadingAuth, fetchTeams, fetchUserTeam, fetchPendingUserTeamRequest]);

  return (
    <TeamContext.Provider value={{
      teams,
      userTeam,
      pendingUserTeamRequest,
      loadingTeams,
      loadingUserTeam,
      loadingPendingUserTeamRequest,
      fetchTeams,
      createTeam,
      sendJoinTeamRequest,
      leaveTeam,
      addTeamScore,
      fetchTeamMembers,
      fetchTeamJoinRequests,
      acceptTeamJoinRequest,
      rejectTeamJoinRequest,
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamProvider");
  }
  return context;
};