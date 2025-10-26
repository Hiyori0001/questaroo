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
  member_count: number; // Now always available
}

interface TeamMemberProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface TeamContextType {
  teams: Team[];
  userTeam: Team | null;
  loadingTeams: boolean;
  loadingUserTeam: boolean;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string, description: string) => Promise<void>;
  joinTeam: (teamId: string) => Promise<void>;
  leaveTeam: () => Promise<void>;
  addTeamScore: (teamId: string, scoreToAdd: number) => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<TeamMemberProfile[]>; // New: Fetch team members
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingAuth } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingUserTeam, setLoadingUserTeam] = useState(true);

  // Fetch all teams with member counts
  const fetchTeams = useCallback(async () => {
    setLoadingTeams(true);
    console.log("TeamContext: Starting fetchTeams...");
    const { data, error } = await supabase
      .from('teams')
      .select('*, profiles!team_id(count)') // Explicitly specify the foreign key relationship
      .order('score', { ascending: false });

    if (error) {
      console.error("TeamContext: Error fetching all teams:", error.message, error.details);
      toast.error("Failed to load teams.");
      setTeams([]);
    } else {
      console.log("TeamContext: Raw data from Supabase:", data);
      const formattedTeams: Team[] = data.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        created_by: team.created_by,
        score: team.score,
        created_at: team.created_at,
        member_count: team.profiles[0]?.count || 0, // Get member count from the aggregated data
      }));
      setTeams(formattedTeams);
      console.log("TeamContext: Formatted teams for state:", formattedTeams);
    }
    setLoadingTeams(false);
    console.log("TeamContext: Finished fetchTeams.");
  }, []); // No dependencies, so this function is stable

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
      // Fetch team details AND its member count directly
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, profiles!team_id(count)') // Explicitly specify the foreign key relationship here too
        .eq('id', profileData.team_id)
        .single();

      if (teamError) {
        console.error("TeamContext: Error fetching user's team details:", teamError.message, teamError.details);
        toast.error("Failed to load your team details.");
        setUserTeam(null);
      } else {
        setUserTeam({
          id: teamData.id,
          name: teamData.name,
          description: teamData.description,
          created_by: teamData.created_by,
          score: teamData.score,
          created_at: teamData.created_at,
          member_count: teamData.profiles[0]?.count || 0, // Get member count from this query
        });
        console.log("TeamContext: User's team data set:", teamData);
      }
    } else {
      console.log("TeamContext: User profile has no team_id or profile not found.");
      setUserTeam(null);
    }
    setLoadingUserTeam(false);
  }, [user]); // Now only depends on 'user', making it stable

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

    // The RLS policy on 'profiles' will automatically filter results based on user permissions.
    // Admins will see all members. Team creators will see members of their team.
    // Other users will only see their own profile if they are in that team.
    return data.map(profile => ({
      id: profile.id,
      first_name: profile.first_name || "Adventure",
      last_name: profile.last_name || "Seeker",
      avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(profile.id)}`,
    }));
  }, [user]);

  const joinTeam = useCallback(async (teamId: string) => {
    if (!user) {
      toast.error("You must be logged in to join a team.");
      return;
    }
    if (userTeam) {
      toast.error("You are already part of a team. Please leave your current team first.");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ team_id: teamId })
      .eq('id', user.id);

    if (error) {
      console.error("TeamContext: Error joining team:", error.message, error.details);
      toast.error("Failed to join team.");
    } else {
      toast.success("Successfully joined the team!");
      fetchUserTeam(user.id); // Refresh user's team status
      fetchTeams(); // Refresh all teams to update member counts
    }
  }, [user, userTeam, fetchUserTeam, fetchTeams]);

  const createTeam = useCallback(async (name: string, description: string) => {
    if (!user) {
      toast.error("You must be logged in to create a team.");
      return;
    }
    if (userTeam) {
      toast.error("You are already part of a team. Please leave your current team first.");
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
      await joinTeam(data.id); // Automatically join the created team
      toast.success(`Team "${name}" created successfully!`);
      fetchTeams(); // Refresh all teams
    }
  }, [user, userTeam, joinTeam, fetchTeams]);

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
      return;
    }

    fetchTeams();

    if (user) {
      fetchUserTeam(user.id);
    } else {
      setUserTeam(null);
      setLoadingUserTeam(false);
    }
  }, [user, loadingAuth, fetchTeams, fetchUserTeam]);

  return (
    <TeamContext.Provider value={{ teams, userTeam, loadingTeams, loadingUserTeam, fetchTeams, createTeam, joinTeam, leaveTeam, addTeamScore, fetchTeamMembers }}>
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