"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Quest } from "@/data/quests"; // Import the Quest interface
import { supabase } from "@/lib/supabase"; // Import supabase client

interface AllUserCreatedQuestsContextType {
  allUserCreatedQuests: Quest[]; // Renamed to reflect it holds all user-created quests
  loadingAllUserCreatedQuests: boolean; // Renamed loading state
  addQuest: (newQuest: Quest) => void;
  removeQuest: (questId: string) => void;
}

const AllUserCreatedQuestsContext = createContext<AllUserCreatedQuestsContextType | undefined>(undefined);

export const AllUserCreatedQuestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingAuth } = useAuth();
  const [allUserCreatedQuests, setAllUserCreatedQuests] = useState<Quest[]>([]);
  const [loadingAllUserCreatedQuests, setLoadingAllUserCreatedQuests] = useState(true);

  const fetchAllUserCreatedQuests = useCallback(async () => {
    setLoadingAllUserCreatedQuests(true);
    // IMPORTANT: Removed .eq('user_id', userId) to fetch ALL user-created quests
    const { data, error } = await supabase
      .from('user_quests')
      .select('*, latitude, longitude, verification_radius, completion_image_prompt, creator_reference_image_url, user_id'); // Select user_id as well

    if (error) {
      console.error("Error fetching all user-created quests:", error);
      toast.error("Failed to load user-created quests.");
      setAllUserCreatedQuests([]);
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
        completionImagePrompt: dbQuest.completion_image_prompt || undefined,
        user_id: dbQuest.user_id, // Include user_id
        latitude: dbQuest.latitude || undefined,
        longitude: dbQuest.longitude || undefined,
        verificationRadius: dbQuest.verification_radius || undefined,
        creatorReferenceImageUrl: dbQuest.creator_reference_image_url || undefined,
      }));
      setAllUserCreatedQuests(fetchedQuests);
    }
    setLoadingAllUserCreatedQuests(false);
  }, []);

  // Load all user-created quests on mount and when auth state changes
  useEffect(() => {
    fetchAllUserCreatedQuests();
  }, [fetchAllUserCreatedQuests]);

  const addQuest = useCallback(async (newQuest: Quest) => {
    if (!user) {
      toast.error("You must be logged in to create a quest.");
      return;
    }

    const { data, error } = await supabase
      .from('user_quests')
      .insert({
        user_id: user.id, // Still associate with the current user
        title: newQuest.title,
        description: newQuest.description,
        location: newQuest.location,
        difficulty: newQuest.difficulty,
        reward: newQuest.reward,
        time_estimate: newQuest.timeEstimate,
        time_limit: newQuest.timeLimit,
        completion_task: newQuest.completionTask,
        qr_code: newQuest.qrCode,
        completion_image_prompt: newQuest.completionImagePrompt,
        latitude: newQuest.latitude,
        longitude: newQuest.longitude,
        verification_radius: newQuest.verificationRadius,
        creator_reference_image_url: newQuest.creatorReferenceImageUrl,
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
        completionImagePrompt: data.completion_image_prompt || undefined,
        user_id: data.user_id,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
        verificationRadius: data.verification_radius || undefined,
        creatorReferenceImageUrl: data.creator_reference_image_url || undefined,
      };
      setAllUserCreatedQuests((prevQuests) => [...prevQuests, addedQuest]); // Update the global list
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
      .eq('user_id', user.id); // Ensure only the creator can delete their quest

    if (error) {
      console.error("Error deleting quest:", error);
      toast.error("Failed to delete quest.");
    } else {
      setAllUserCreatedQuests((prevQuests) => prevQuests.filter(quest => quest.id !== questId)); // Update the global list
      toast.info("Quest deleted successfully.");
    }
  }, [user]);

  return (
    <AllUserCreatedQuestsContext.Provider value={{ allUserCreatedQuests, loadingAllUserCreatedQuests, addQuest, removeQuest }}>
      {children}
    </AllUserCreatedQuestsContext.Provider>
  );
};

export const useAllUserCreatedQuests = () => {
  const context = useContext(AllUserCreatedQuestsContext);
  if (context === undefined) {
    throw new Error("useAllUserCreatedQuests must be used within an AllUserCreatedQuestsProvider");
  }
  return context;
};