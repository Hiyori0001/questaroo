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
  member_count?: number; // To store aggregated member count
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
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingAuth } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingUserTeam, setLoadingUserTeam] = useState(true);

  // Fetch all teams
  const fetchTeams = useCallback(async () => {
    setLoadingTeams(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*, profiles(count)') // Select teams and count of profiles for each team
      .order('score', { ascending: false });

    if (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams.");
      setTeams([]);
    } else {
      const formattedTeams: Team[] = data.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        created_by: team.created_by,
        score: team.score,
        created_at: team.created_at,
        member_count: team.profiles[0]?.count || 0, // Extract member count
      }));
      setTeams(formattedTeams);
    }
    setLoadingTeams(false);
  }, []);

  // Fetch the current user's team
  const fetchUserTeam = useCallback(async (userId: string) => {
    setLoadingUserTeam(true);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching user profile for team_id:", profileError);
      toast.error("Failed to load your team status.");
      setUserTeam(null);
    } else if (profileData?.team_id) {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, profiles(count)')
        .eq('id', profileData.team_id)
        .single();

      if (teamError) {
        console.error("Error fetching user's team:", teamError);
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
          member_count: teamData.profiles[0]?.count || 0,
        });
      }
    } else {
      setUserTeam(null);
    }
    setLoadingUserTeam(false);
  }, []);

  // Define joinTeam before createTeam
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
      console.error("Error joining team:", error);
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
      console.error("Error creating team:", error);
      toast.error(`Failed to create team "${name}". ${error.message}`);
    } else {
      // Automatically join the created team
      await joinTeam(data.id);
      toast.success(`Team "${name}" created successfully!`);
      fetchTeams(); // Refresh all teams
    }
  }, [user, userTeam, joinTeam, fetchTeams]); // joinTeam is now in dependencies

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
      console.error("Error leaving team:", error);
      toast.error("Failed to leave team.");
    } else {
      toast.success("Successfully left the team.");
      setUserTeam(null); // Clear user's team
      fetchTeams(); // Refresh all teams to update member counts
    }
  }, [user, userTeam, fetchTeams]);

  // Effect to load teams and user's team on auth state change
  useEffect(() => {
    if (loadingAuth) {
      setLoadingTeams(true);
      setLoadingUserTeam(true);
      return;
    }

    fetchTeams(); // Always fetch all teams

    if (user) {
      fetchUserTeam(user.id);
    } else {
      setUserTeam(null); // Clear user team if no user is logged in
      setLoadingUserTeam(false);
    }
  }, [user, loadingAuth, fetchTeams, fetchUserTeam]);

  return (
    <TeamContext.Provider value={{ teams, userTeam, loadingTeams, loadingUserTeam, fetchTeams, createTeam, joinTeam, leaveTeam }}>
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