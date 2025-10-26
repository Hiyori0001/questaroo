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
  updateAvatar: () => Promise<void>; // Function to update avatar with a random one
  uploadAvatar: (file: File) => Promise<void>; // New: Function to upload a custom avatar
  getAchievementIcon: (iconName: string) => LucideIcon | undefined;
  startQuest: (questId: string) => Promise<void>; // New: Mark quest as started
  completeQuest: (questId: string) => Promise<void>; // New: Mark quest as completed (now only updates status)
  submitImageForVerification: (questId: string, imageFile: File) => Promise<void>; // New: Submit image for review
  verifyQuestCompletion: (userId: string, questId: string, status: 'approved' | 'rejected', xpReward: number, questTitle: string, teamId?: string) => Promise<void>; // New: Creator/Admin verification
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

    // Only update name fields in the database
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        // Do NOT update avatar_url here, it's handled by updateAvatar or uploadAvatar
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
        avatarUrl: prev.avatarUrl, // Keep the existing avatarUrl
      } : null);
      toast.success("Profile updated successfully!");
    }
  }, [profile, user]);

  const updateAvatar = useCallback(async () => {
    if (!user || !profile) {
      toast.error("You must be logged in to update your avatar.");
      return;
    }

    const randomSeed = Math.random().toString(36).substring(2, 15); // Generate a random string for the seed
    const newAvatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(randomSeed)}`;

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.id);

    if (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar.");
    } else {
      setProfile((prev) => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
      toast.success("Avatar updated successfully!");
    }
  }, [user, profile]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user || !profile) {
      toast.error("You must be logged in to upload an avatar.");
      return;
    }

    const fileExtension = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExtension}`; // Store in user's folder

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars') // Assuming a bucket named 'avatars' exists
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite existing file if it has the same path
      });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      toast.error("Failed to upload avatar: " + uploadError.message);
      return;
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      toast.error("Failed to get public URL for avatar.");
      return;
    }

    const newAvatarUrl = publicUrlData.publicUrl;

    // Update the profile table with the new avatar URL
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error("Error updating profile with new avatar URL:", updateProfileError);
      toast.error("Failed to update profile with new avatar.");
    } else {
      setProfile((prev) => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
      toast.success("Custom avatar uploaded successfully!");
    }
  }, [user, profile]);

  const startQuest = useCallback(async (questId: string) => {
    if (!user) {
      toast.error("You must be logged in to start a quest.");
      return;
    }

    const { error } = await supabase
      .from('user_quest_progress')
      .upsert(
        { user_id: user.id, quest_id: questId, status: 'started', started_at: new Date().toISOString(), last_updated_at: new Date().toISOString(), verification_status: 'not_applicable' }, // Default for non-image quests
        { onConflict: 'user_id, quest_id' } // Update if already exists
      );

    if (error) {
      console.error("Error starting quest:", error);
      toast.error("Failed to mark quest as started.");
    } else {
      toast.info("Quest started!");
    }
  }, [user]);

  // This function now only updates the status to 'completed' without granting rewards
  const completeQuest = useCallback(async (questId: string) => {
    if (!user) {
      toast.error("You must be logged in to complete a quest.");
      return;
    }

    const { error } = await supabase
      .from('user_quest_progress')
      .update({ status: 'completed', completed_at: new Date().toISOString(), last_updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('quest_id', questId);

    if (error) {
      console.error("Error completing quest:", error);
      toast.error("Failed to mark quest as completed.");
    } else {
      // Rewards are now handled by verifyQuestCompletion
      toast.info("Quest progress updated to completed!");
    }
  }, [user]);

  const submitImageForVerification = useCallback(async (questId: string, imageFile: File) => {
    if (!user) {
      throw new Error("User not authenticated.");
    }

    const fileExtension = imageFile.name.split('.').pop();
    const filePath = `${user.id}/${questId}/${Date.now()}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('quest-completion-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('quest-completion-images')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded image.");
    }

    const { error: updateError } = await supabase
      .from('user_quest_progress')
      .update({
        completion_image_url: publicUrlData.publicUrl,
        verification_status: 'pending',
        status: 'started', // Keep status as 'started' until approved
        last_updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('quest_id', questId);

    if (updateError) {
      throw updateError;
    }
  }, [user]);

  const verifyQuestCompletion = useCallback(async (
    targetUserId: string,
    questId: string,
    status: 'approved' | 'rejected',
    xpReward: number,
    questTitle: string,
    teamId?: string
  ) => {
    if (!user || !profile?.isAdmin) { // Only admins can verify
      toast.error("You do not have permission to verify quests.");
      return;
    }

    const { error: updateError } = await supabase
      .from('user_quest_progress')
      .update({
        verification_status: status,
        status: status === 'approved' ? 'completed' : 'failed', // Mark as completed or failed
        completed_at: status === 'approved' ? new Date().toISOString() : null,
        last_updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId)
      .eq('quest_id', questId);

    if (updateError) {
      console.error("Error updating quest verification status:", updateError);
      toast.error("Failed to update quest verification status.");
      return;
    }

    if (status === 'approved') {
      // Grant XP and achievement to the target user
      const { data: targetProfile, error: fetchProfileError } = await supabase
        .from('profiles')
        .select('experience, achievements')
        .eq('id', targetUserId)
        .single();

      if (fetchProfileError || !targetProfile) {
        console.error("Error fetching target user profile for rewards:", fetchProfileError);
        toast.error("Failed to grant rewards: Could not fetch user profile.");
        return;
      }

      const newExperience = targetProfile.experience + xpReward;
      const newLevel = calculateLevel(newExperience);
      const newAchievement: Achievement = {
        name: `Completed: ${questTitle}`,
        iconName: "Trophy",
        color: "bg-green-500",
      };
      const updatedAchievements = targetProfile.achievements.some((a: Achievement) => a.name === newAchievement.name)
        ? targetProfile.achievements
        : [...targetProfile.achievements, newAchievement];

      const { error: rewardError } = await supabase
        .from('profiles')
        .update({
          experience: newExperience,
          achievements: updatedAchievements,
        })
        .eq('id', targetUserId);

      if (rewardError) {
        console.error("Error granting rewards:", rewardError);
        toast.error("Failed to grant XP and achievement.");
      } else {
        toast.success(`Quest "${questTitle}" approved! ${targetUserId} received ${xpReward} XP.`);
        // Optionally update the current user's profile if it's the target user
        if (user?.id === targetUserId) {
          setProfile((prev) => prev ? { ...prev, experience: newExperience, level: newLevel, achievements: updatedAchievements } : null);
        }
      }

      // Add team score if applicable
      if (teamId) {
        // This would ideally call a function from TeamContext to update team score
        // For now, we'll just log it or add a placeholder
        console.log(`Team ${teamId} would receive ${xpReward} points for quest ${questTitle}.`);
        // You would call addTeamScore here if it were available in this context
        // await addTeamScore(teamId, xpReward);
      }

    } else {
      toast.info(`Quest "${questTitle}" rejected for ${targetUserId}.`);
    }
  }, [user, profile]);


  const getAchievementIcon = useCallback((iconName: string) => {
    return LucideIconMap[iconName];
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, loadingProfile, addExperience, deductExperience, addAchievement, updateProfileDetails, updateAvatar, uploadAvatar, getAchievementIcon, startQuest, completeQuest, submitImageForVerification, verifyQuestCompletion }}>
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