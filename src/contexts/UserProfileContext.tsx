"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { LucideIcon, Trophy, Star } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import supabase client

// Define the Achievement type
interface Achievement {
  name: string;
  iconName: string; // Store icon name as string
  color: string;
}

// Map icon names to their actual Lucide React components
const LucideIconMap: { [key: string]: LucideIcon } = {
  Trophy: Trophy,
  Star: Star,
  // Add other icons here if they are used in achievements
};

interface UserProfile {
  id: string; // Add id to profile
  name: string;
  email: string;
  avatarUrl: string;
  level: number;
  experience: number;
  achievements: Achievement[];
  isAdmin: boolean; // Add isAdmin to the profile interface
}

// Define XP thresholds for unlocking content
export const XP_THRESHOLDS = {
  EASY: 0, // Added this for consistency, Easy quests require 0 XP to unlock
  QUEST_MEDIUM: 500,
  QUEST_HARD: 1500,
  MINIGAME_GUESS_NUMBER: 100,
  MINIGAME_CLICKER_CHALLENGE: 200,
  MINIGAME_MEMORY_MATCH: 300,
  MINIGAME_REACTION_TIME: 400,
  MINIGAME_LIGHTS_ON: 500,
};

interface UserProfileContextType {
  profile: UserProfile | null;
  loadingProfile: boolean;
  addExperience: (xp: number) => Promise<void>;
  deductExperience: (xp: number) => Promise<boolean>; // New function to deduct XP
  addAchievement: (achievement: Achievement) => Promise<void>;
  updateProfileDetails: (name: string, email: string) => Promise<void>;
  getAchievementIcon: (iconName: string) => LucideIcon | undefined;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const calculateLevel = (xp: number): number => {
  // Simple linear progression: 1000 XP per level after level 1
  if (xp < 1000) return 1;
  return Math.floor(xp / 1000) + 1;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    setLoadingProfile(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, experience, achievements, is_admin') // Select is_admin
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching profile:", error);
      toast.error("Failed to load user profile.");
      setProfile(null);
    } else if (data) {
      // Reconstruct profile from fetched data
      const fetchedProfile: UserProfile = {
        id: data.id,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || "Adventure Seeker",
        email: user?.email || "unknown@example.com", // Email comes from auth.user
        avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(data.id)}`,
        experience: data.experience || 0,
        level: calculateLevel(data.experience || 0),
        achievements: data.achievements || [],
        isAdmin: data.is_admin || false, // Set isAdmin
      };
      setProfile(fetchedProfile);
    } else {
      // If no profile exists, create a default one in DB
      const newProfileData = {
        id: userId,
        first_name: "Adventure",
        last_name: "Seeker",
        avatar_url: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(userId)}`,
        experience: 0,
        achievements: [],
        is_admin: false, // Default to not admin
      };
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfileData)
        .select()
        .single();

      if (insertError) {
        console.error("Error creating new profile:", insertError);
        toast.error("Failed to create new user profile.");
        setProfile(null);
      } else {
        const createdProfile: UserProfile = {
          id: newProfile.id,
          name: `${newProfile.first_name || ''} ${newProfile.last_name || ''}`.trim(),
          email: user?.email || "unknown@example.com",
          avatarUrl: newProfile.avatar_url,
          experience: newProfile.experience,
          level: calculateLevel(newProfile.experience),
          achievements: newProfile.achievements,
          isAdmin: newProfile.is_admin,
        };
        setProfile(createdProfile);
      }
    }
    setLoadingProfile(false);
  }, [user]); // Depend on user to get email

  // Load profile when user changes
  useEffect(() => {
    if (loadingAuth) {
      setLoadingProfile(true);
      return;
    }

    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null); // No user, no profile
      setLoadingProfile(false);
    }
  }, [user, loadingAuth, fetchProfile]);

  const addExperience = useCallback(async (xp: number) => {
    if (!profile || !user) return;

    const newExperience = profile.experience + xp;
    const newLevel = calculateLevel(newExperience);

    const { error } = await supabase
      .from('profiles')
      .update({ experience: newExperience })
      .eq('id', user.id);

    if (error) {
      console.error("Error adding experience:", error);
      toast.error("Failed to update experience.");
    } else {
      setProfile((prev) => prev ? { ...prev, experience: newExperience, level: newLevel } : null);
      if (newLevel > profile.level) {
        toast.success(`Level Up! You are now Level ${newLevel}!`);
      } else {
        toast.info(`+${xp} XP!`);
      }
    }
  }, [profile, user]);

  const deductExperience = useCallback(async (xp: number): Promise<boolean> => {
    if (!profile || !user) {
      toast.error("You must be logged in to spend XP.");
      console.log("Deduct XP: Not logged in or no profile.");
      return false;
    }
    if (profile.experience < xp) {
      toast.error("Not enough XP to unlock this item.");
      console.log(`Deduct XP: Not enough XP. Current: ${profile.experience}, Needed: ${xp}`);
      return false;
    }

    const newExperience = profile.experience - xp;
    const newLevel = calculateLevel(newExperience);

    console.log(`Attempting to deduct ${xp} XP. New experience: ${newExperience}`);

    const { error } = await supabase
      .from('profiles')
      .update({ experience: newExperience })
      .eq('id', user.id);

    if (error) {
      console.error("Error deducting experience:", error);
      toast.error("Failed to deduct XP.");
      return false;
    } else {
      setProfile((prev) => prev ? { ...prev, experience: newExperience, level: newLevel } : null);
      toast.success(`-${xp} XP spent.`);
      console.log(`Successfully deducted ${xp} XP. New profile experience: ${newExperience}`);
      return true;
    }
  }, [profile, user]);

  const addAchievement = useCallback(async (newAchievement: Achievement) => {
    if (!profile || !user) return;

    if (profile.achievements.some(a => a.name === newAchievement.name)) {
      toast.info(`Achievement "${newAchievement.name}" already earned!`);
      return;
    }

    const updatedAchievements = [...profile.achievements, newAchievement];

    const { error } = await supabase
      .from('profiles')
      .update({ achievements: updatedAchievements })
      .eq('id', user.id);

    if (error) {
      console.error("Error adding achievement:", error);
      toast.error("Failed to unlock achievement.");
    } else {
      setProfile((prev) => prev ? { ...prev, achievements: updatedAchievements } : null);
      toast.success(`Achievement Unlocked: ${newAchievement.name}!`);
    }
  }, [profile, user]);

  const updateProfileDetails = useCallback(async (name: string, email: string) => {
    if (!profile || !user) return;

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        avatar_url: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}`,
      })
      .eq('id', user.id);

    if (error) {
      console.error("Error updating profile details:", error);
      toast.error("Failed to update profile details.");
    } else {
      // Also update auth.user email if it changed
      if (user.email !== email) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({ email });
        if (emailUpdateError) {
          console.error("Error updating user email:", emailUpdateError);
          toast.error("Failed to update email in authentication.");
          // Revert profile update if email update fails, or handle gracefully
        } else {
          toast.success("Email updated successfully in authentication.");
        }
      }

      setProfile((prev) => prev ? {
        ...prev,
        name,
        email,
        avatarUrl: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}`,
      } : null);
      toast.success("Profile updated successfully!");
    }
  }, [profile, user]);

  const getAchievementIcon = useCallback((iconName: string) => {
    return LucideIconMap[iconName];
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, loadingProfile, addExperience, deductExperience, addAchievement, updateProfileDetails, getAchievementIcon }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};