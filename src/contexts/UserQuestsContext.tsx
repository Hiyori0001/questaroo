"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Quest } from "@/data/quests"; // Import the Quest interface
import { supabase } from "@/lib/supabase"; // Import supabase client

interface UserQuestsContextType {
  userQuests: Quest[];
  loadingUserQuests: boolean;
  addQuest: (newQuest: Quest) => void;
  removeQuest: (questId: string) => void;
}

const UserQuestsContext = createContext<UserQuestsContextType | undefined>(undefined);

export const UserQuestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingAuth } = useAuth();
  const [userQuests, setUserQuests] = useState<Quest[]>([]);
  const [loadingUserQuests, setLoadingUserQuests] = useState(true);

  const fetchUserQuests = useCallback(async (userId: string) => {
    setLoadingUserQuests(true);
    const { data, error } = await supabase
      .from('user_quests')
      .select('*, latitude, longitude, verification_radius') // Select new columns
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching user quests:", error);
      toast.error("Failed to load your created quests.");
      setUserQuests([]);
    } else {
      // Map Supabase data to Quest interface
      const fetchedQuests: Quest[] = data.map(dbQuest => ({
        id: dbQuest.id,
        title: dbQuest.title,
        description: dbQuest.description,
        location: dbQuest.location,
        difficulty: dbQuest.difficulty as Quest["difficulty"],
        reward: dbQuest.reward,
        timeEstimate: dbQuest.time_estimate,
        timeLimit: dbQuest.time_limit || undefined,
        completionTask: dbQuest.completion_task || undefined,
        qrCode: dbQuest.qr_code || undefined,
        user_id: dbQuest.user_id, // Include user_id
        latitude: dbQuest.latitude || undefined, // Include latitude
        longitude: dbQuest.longitude || undefined, // Include longitude
        verificationRadius: dbQuest.verification_radius || undefined, // Include verificationRadius
      }));
      setUserQuests(fetchedQuests);
    }
    setLoadingUserQuests(false);
  }, []);

  // Load user quests from Supabase when user changes or on mount
  useEffect(() => {
    if (loadingAuth) {
      setLoadingUserQuests(true);
      return;
    }

    if (user) {
      fetchUserQuests(user.id);
    } else {
      setUserQuests([]); // Clear quests if no user is logged in
      setLoadingUserQuests(false);
    }
  }, [user, loadingAuth, fetchUserQuests]);

  const addQuest = useCallback(async (newQuest: Quest) => {
    if (!user) {
      toast.error("You must be logged in to create a quest.");
      return;
    }

    const { data, error } = await supabase
      .from('user_quests')
      .insert({
        user_id: user.id,
        title: newQuest.title,
        description: newQuest.description,
        location: newQuest.location,
        difficulty: newQuest.difficulty,
        reward: newQuest.reward,
        time_estimate: newQuest.timeEstimate,
        time_limit: newQuest.timeLimit,
        completion_task: newQuest.completionTask,
        qr_code: newQuest.qrCode,
        latitude: newQuest.latitude,
        longitude: newQuest.longitude,
        verification_radius: newQuest.verificationRadius, // Insert verification_radius
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding quest:", error);
      toast.error(`Failed to create quest "${newQuest.title}".`);
    } else {
      const addedQuest: Quest = {
        id: data.id,
        title: data.title,
        description: data.description,
        location: data.location,
        difficulty: data.difficulty as Quest["difficulty"],
        reward: data.reward,
        timeEstimate: data.time_estimate,
        timeLimit: data.time_limit || undefined,
        completionTask: data.completion_task || undefined,
        qrCode: data.qr_code || undefined,
        user_id: data.user_id,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
        verificationRadius: data.verification_radius || undefined, // Include verificationRadius
      };
      setUserQuests((prevQuests) => [...prevQuests, addedQuest]);
      toast.success(`Quest "${newQuest.title}" created successfully!`);
    }
  }, [user]);

  const removeQuest = useCallback(async (questId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete a quest.");
      return;
    }

    const { error } = await supabase
      .from('user_quests')
      .delete()
      .eq('id', questId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error deleting quest:", error);
      toast.error("Failed to delete quest.");
    } else {
      setUserQuests((prevQuests) => prevQuests.filter(quest => quest.id !== questId));
      toast.info("Quest deleted successfully.");
    }
  }, [user]);

  return (
    <UserQuestsContext.Provider value={{ userQuests, loadingUserQuests, addQuest, removeQuest }}>
      {children}
    </UserQuestsContext.Provider>
  );
};

export const useUserQuests = () => {
  const context = useContext(UserQuestsContext);
  if (context === undefined) {
    throw new Error("useUserQuests must be used within a UserQuestsProvider");
  }
  return context;
};