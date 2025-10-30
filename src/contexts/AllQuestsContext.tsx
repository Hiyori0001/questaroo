"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Quest } from "@/data/quests"; // Import the Quest interface
import { supabase } from "@/lib/supabase"; // Import supabase client

interface AllQuestsContextType {
  allQuests: Quest[]; // Renamed to reflect it holds all quests
  loadingAllQuests: boolean; // Renamed loading state
  addQuest: (newQuest: Quest) => void; // For user-created quests
  removeQuest: (questId: string) => void; // For user-created quests
}

const AllQuestsContext = createContext<AllQuestsContextType | undefined>(undefined);

export const AllQuestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [loadingAllQuests, setLoadingAllQuests] = useState(true);

  const fetchAllQuests = useCallback(async () => {
    setLoadingAllQuests(true);
    try {
      // Fetch user-created quests
      const { data: userQuestsData, error: userQuestsError } = await supabase
        .from('user_quests')
        .select('*, latitude, longitude, verification_radius, completion_image_prompt, creator_reference_image_url, user_id');

      if (userQuestsError) {
        throw userQuestsError;
      }

      const userCreatedQuests: Quest[] = userQuestsData.map(dbQuest => ({
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
        user_id: dbQuest.user_id,
        latitude: dbQuest.latitude || undefined,
        longitude: dbQuest.longitude || undefined,
        verificationRadius: dbQuest.verification_radius || undefined,
        creatorReferenceImageUrl: dbQuest.creator_reference_image_url || undefined,
        is_predefined: false, // Mark as user-created
      }));

      // Fetch predefined quests
      const { data: predefinedQuestsData, error: predefinedQuestsError } = await supabase
        .from('predefined_quests')
        .select('*, latitude, longitude, verification_radius, completion_image_prompt, creator_reference_image_url');

      if (predefinedQuestsError) {
        throw predefinedQuestsError;
      }

      const predefinedQuests: Quest[] = predefinedQuestsData.map(dbQuest => ({
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
        latitude: dbQuest.latitude || undefined,
        longitude: dbQuest.longitude || undefined,
        verificationRadius: dbQuest.verification_radius || undefined,
        creatorReferenceImageUrl: dbQuest.creator_reference_image_url || undefined,
        is_predefined: true, // Mark as predefined
      }));

      setAllQuests([...predefinedQuests, ...userCreatedQuests]);
    } catch (error: any) {
      console.error("Error fetching all quests:", error.message);
      toast.error("Failed to load quests.");
      setAllQuests([]);
    } finally {
      setLoadingAllQuests(false);
    }
  }, []);

  useEffect(() => {
    fetchAllQuests();
  }, [fetchAllQuests]);

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
        is_predefined: false,
      };
      setAllQuests((prevQuests) => [...prevQuests, addedQuest]);
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
      setAllQuests((prevQuests) => prevQuests.filter(quest => quest.id !== questId));
      toast.info("Quest deleted successfully.");
    }
  }, [user]);

  return (
    <AllQuestsContext.Provider value={{ allQuests, loadingAllQuests, addQuest, removeQuest }}>
      {children}
    </AllQuestsContext.Provider>
  );
};

export const useAllQuests = () => {
  const context = useContext(AllQuestsContext);
  if (context === undefined) {
    throw new Error("useAllQuests must be used within an AllQuestsProvider");
  }
  return context;
};