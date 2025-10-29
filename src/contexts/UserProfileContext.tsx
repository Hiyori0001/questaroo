"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { LucideIcon, Trophy, Star, Award, Gem, Crown, RefreshCw, Sparkles, Shield } from "lucide-react"; // Added RefreshCw, Sparkles, Shield
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
  Award: Award, // Added
  Gem: Gem,     // Added
  Crown: Crown, // Added
  RefreshCw: RefreshCw, // Added
  Sparkles: Sparkles, // Added
  Shield: Shield, // Added
  // Add other icons here if they are used in achievements
};

interface UserProfile {
  id: string; // Add id to profile
  name: string;
  email: string;
  avatarUrl: string;
  level: number;
  experience: number;
  currency: number; // New: Virtual currency
  achievements: Achievement[];
  isAdmin: boolean; // Add isAdmin to the profile interface
  lastLoginAt: string | null; // New: Last login timestamp for daily bonus
  loginStreak: number; // New: Current login streak
  maxLoginStreak: number; // New: Max login streak
}

// Define XP thresholds for unlocking content
export const XP_THRESHOLDS = {
  EASY: 0, // Added this for consistency, Easy quests require 0 XP to unlock
  QUEST_MEDIUM: 750, // Increased from 500
  QUEST_HARD: 2000, // Increased from 1500
  MINIGAME_GUESS_NUMBER: 250, // Increased from 100
  MINIGAME_CLICKER_CHALLENGE: 400, // Increased from 200
  MINIGAME_MEMORY_MATCH: 600, // Increased from 300
  MINIGAME_REACTION_TIME: 800, // Increased from 400
  MINIGAME_LIGHTS_ON: 1000, // Increased from 500
};

interface UserProfileContextType {
  profile: UserProfile | null;
  loadingProfile: boolean;
  addExperience: (xp: number) => Promise<void>;
  deductExperience: (xp: number) => Promise<boolean>; // New function to deduct XP
  addCurrency: (amount: number) => Promise<void>; // New: Add currency
  deductCurrency: (amount: number) => Promise<boolean>; // New: Deduct currency
  addAchievement: (achievement: Achievement) => Promise<void>;
  updateProfileDetails: (name: string, email: string) => Promise<void>;
  updateAvatar: () => Promise<void>; // Function to update avatar with a random one
  uploadAvatar: (file: File) => Promise<void>; // New: Function to upload a custom avatar
  getAchievementIcon: (iconName: string) => LucideIcon | undefined;
  startQuest: (questId: string) => Promise<void>; // New: Mark quest as started
  completeQuest: (questId: string) => Promise<void>; // New: Mark quest as completed (now only updates status)
  submitImageForVerification: (questId: string, imageFile: File) => Promise<void>; // New: Submit image for review
  verifyQuestCompletion: (userId: string, questId: string, status: 'approved' | 'rejected', xpReward: number, questTitle: string, teamId?: string) => Promise<void>; // New: Creator/Admin verification
  grantChallengeReward: (userId: string, challengeId: string, status: 'completed' | 'failed', rewardType: string, xpAmount: number, challengeName: string, teamId: string | null) => Promise<void>; // New: Grant challenge rewards
  submitChallengeCompletion: (challengeId: string, details: string, imageFile: File | null) => Promise<void>; // New: Submit challenge completion
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

  const checkAndGrantDailyBonus = useCallback(async (currentProfile: UserProfile, userId: string) => {
    const now = new Date();
    const lastLogin = currentProfile.lastLoginAt ? new Date(currentProfile.lastLoginAt) : null;

    let newLoginStreak = currentProfile.loginStreak;
    let newMaxLoginStreak = currentProfile.maxLoginStreak;
    let bonusGranted = false;
    let bonusCoins = 0;
    let bonusXp = 0;

    if (!lastLogin || now.toDateString() !== lastLogin.toDateString()) {
      // It's a new day
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      if (lastLogin && lastLogin.toDateString() === yesterday.toDateString()) {
        // Consecutive day login
        newLoginStreak += 1;
        toast.success(`Daily Login Bonus! Streak: ${newLoginStreak} days!`);
      } else {
        // Streak broken or first login
        newLoginStreak = 1;
        toast.info("Daily Login Bonus! Your streak starts now!");
      }

      newMaxLoginStreak = Math.max(newMaxLoginStreak, newLoginStreak);

      // Calculate bonus based on streak
      bonusCoins = 10 + (newLoginStreak * 5); // Base 10 coins + 5 per streak day
      bonusXp = 50 + (newLoginStreak * 10); // Base 50 XP + 10 per streak day

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          last_login_at: now.toISOString(),
          login_streak: newLoginStreak,
          max_login_streak: newMaxLoginStreak,
          currency: currentProfile.currency + bonusCoins,
          experience: currentProfile.experience + bonusXp,
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating daily login bonus:", updateError);
        toast.error("Failed to grant daily bonus.");
      } else {
        setProfile((prev) => prev ? {
          ...prev,
          lastLoginAt: now.toISOString(),
          loginStreak: newLoginStreak,
          maxLoginStreak: newMaxLoginStreak,
          currency: prev.currency + bonusCoins,
          experience: prev.experience + bonusXp,
          level: calculateLevel(prev.experience + bonusXp),
        } : null);
        toast.success(`You received ${bonusCoins} Coins and ${bonusXp} XP!`);
        bonusGranted = true;
      }
    } else {
      // Already logged in today
      toast.info("You've already claimed your daily bonus today!");
    }
    return bonusGranted;
  }, []);


  const fetchProfile = useCallback(async (userId: string) => {
    setLoadingProfile(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, experience, currency, achievements, is_admin, last_login_at, login_streak, max_login_streak') // Select new fields
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
        currency: data.currency || 0, // Set currency
        level: calculateLevel(data.experience || 0),
        achievements: data.achievements || [],
        isAdmin: data.is_admin || false, // Set isAdmin
        lastLoginAt: data.last_login_at, // Set new fields
        loginStreak: data.login_streak || 0,
        maxLoginStreak: data.max_login_streak || 0,
      };
      setProfile(fetchedProfile);
      // After fetching, check for daily bonus
      await checkAndGrantDailyBonus(fetchedProfile, userId);

    } else {
      // If no profile exists, create a default one in DB
      const newProfileData = {
        id: userId,
        first_name: "Adventure",
        last_name: "Seeker",
        avatar_url: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(userId)}`,
        experience: 0,
        currency: 0, // Default currency for new profile
        achievements: [],
        is_admin: false, // Default to not admin
        last_login_at: new Date().toISOString(), // Set initial login time
        login_streak: 0, // Initial streak
        max_login_streak: 0, // Initial max streak
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
          currency: newProfile.currency, // Set currency for new profile
          level: calculateLevel(newProfile.experience),
          achievements: newProfile.achievements,
          isAdmin: newProfile.is_admin,
          lastLoginAt: newProfile.last_login_at, // Set new fields
          loginStreak: newProfile.login_streak,
          maxLoginStreak: newProfile.max_login_streak,
        };
        setProfile(createdProfile);
        // Grant initial bonus for brand new profile
        await checkAndGrantDailyBonus(createdProfile, userId);
      }
    }
    setLoadingProfile(false);
  }, [user, checkAndGrantDailyBonus]); // Depend on user to get email and checkAndGrantDailyBonus

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
        // Only show +XP toast if not leveling up, to avoid double notifications
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

  const addCurrency = useCallback(async (amount: number) => {
    if (!profile || !user) return;

    const newCurrency = profile.currency + amount;

    const { error } = await supabase
      .from('profiles')
      .update({ currency: newCurrency })
      .eq('id', user.id);

    if (error) {
      console.error("Error adding currency:", error);
      toast.error("Failed to update currency.");
    } else {
      setProfile((prev) => prev ? { ...prev, currency: newCurrency } : null);
      // Removed toast.info(`+${amount} Coins!`); to reduce notification frequency
    }
  }, [profile, user]);

  const deductCurrency = useCallback(async (amount: number): Promise<boolean> => {
    if (!profile || !user) {
      toast.error("You must be logged in to spend currency.");
      return false;
    }
    if (profile.currency < amount) {
      toast.error("Not enough coins.");
      return false;
    }

    const newCurrency = profile.currency - amount;

    const { error } = await supabase
      .from('profiles')
      .update({ currency: newCurrency })
      .eq('id', user.id);

    if (error) {
      console.error("Error deducting currency:", error);
      toast.error("Failed to deduct coins.");
      return false;
    } else {
      setProfile((prev) => prev ? { ...prev, currency: newCurrency } : null);
      // Removed toast.success(`-${amount} Coins spent.`); to reduce notification frequency
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
        .select('experience, currency, achievements') // Select currency
        .eq('id', targetUserId)
        .single();

      if (fetchProfileError || !targetProfile) {
        console.error("Error fetching target user profile for rewards:", fetchProfileError);
        toast.error("Failed to grant rewards: Could not fetch user profile.");
        return;
      }

      const newExperience = targetProfile.experience + xpReward;
      const newCurrency = targetProfile.currency + 50; // Example: 50 coins per quest completion
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
          currency: newCurrency, // Update currency
          achievements: updatedAchievements,
        })
        .eq('id', targetUserId);

      if (rewardError) {
        console.error("Error granting rewards:", rewardError);
        toast.error("Failed to grant XP and achievement.");
      } else {
        toast.success(`Quest "${questTitle}" approved! ${targetUserId} received ${xpReward} XP and 50 Coins.`);
        // Optionally update the current user's profile if it's the target user
        if (user?.id === targetUserId) {
          setProfile((prev) => prev ? { ...prev, experience: newExperience, level: newLevel, achievements: updatedAchievements, currency: newCurrency } : null);
        }
      }

      // Add team score if applicable
      if (teamId) {
        // This would ideally call a function from TeamContext to update team score
        // For now, we'll just log it or add a placeholder
        console.log(`Team ${teamId} would receive ${xpReward} points for quest ${questTitle}.`);
        // await addTeamScore(teamId, xpReward); // This needs to be imported or passed
      }

    } else {
      toast.info(`Quest "${questTitle}" rejected for ${targetUserId}.`);
    }
  }, [user, profile]);

  const grantChallengeReward = useCallback(async (
    targetUserId: string,
    challengeId: string,
    status: 'completed' | 'failed',
    rewardType: string,
    xpAmount: number,
    challengeName: string,
    teamId: string | null
  ) => {
    if (!user || !profile?.isAdmin) {
      toast.error("You do not have permission to grant challenge rewards.");
      return;
    }

    // 1. Update user_challenge_participation status
    const { error: updateParticipationError } = await supabase
      .from('user_challenge_participation')
      .update({ status: status })
      .eq('user_id', targetUserId)
      .eq('challenge_id', challengeId);

    if (updateParticipationError) {
      console.error("Error updating challenge participation status:", updateParticipationError);
      toast.error("Failed to update challenge participation status.");
      return;
    }

    if (status === 'completed') {
      // 2. Grant rewards based on rewardType
      const { data: targetProfile, error: fetchProfileError } = await supabase
        .from('profiles')
        .select('experience, currency, achievements') // Select currency
        .eq('id', targetUserId)
        .single();

      if (fetchProfileError || !targetProfile) {
        console.error("Error fetching target user profile for challenge rewards:", fetchProfileError);
        toast.error("Failed to grant challenge rewards: Could not fetch user profile.");
        return;
      }

      let newExperience = targetProfile.experience;
      let newCurrency = targetProfile.currency; // Initialize with current currency
      const updatedAchievements = [...targetProfile.achievements];

      if (rewardType === "Team XP") {
        newExperience += xpAmount; // Add XP to individual for now, or to team directly
        newCurrency += 25; // Example: 25 coins for Team XP challenge
        // If we had a direct way to add to team XP from here, we'd use it.
        // For now, we'll assume 'Team XP' means individual XP contribution or a separate admin action.
        // A more robust system would involve a `useTeams` context function here.
        toast.info(`User ${targetUserId} received ${xpAmount} XP and 25 Coins for team contribution.`);
      } else if (rewardType === "Exclusive Badge") {
        const newAchievement: Achievement = {
          name: `Exclusive Badge: ${challengeName}`,
          iconName: "Award", // Use Award icon for badges
          color: "bg-indigo-500", // A distinct color for exclusive badges
        };
        if (!updatedAchievements.some((a: Achievement) => a.name === newAchievement.name)) {
          updatedAchievements.push(newAchievement);
        }
        newCurrency += 75; // Example: 75 coins for an exclusive badge
        toast.success(`User ${targetUserId} earned the "${newAchievement.name}" and 75 Coins!`);
      } else if (rewardType === "Rare Item") {
        const newAchievement: Achievement = {
          name: `Rare Item: ${challengeName} Collectible`,
          iconName: "Gem", // Use Gem icon for rare items
          color: "bg-yellow-500", // A distinct color for rare items
        };
        if (!updatedAchievements.some((a: Achievement) => a.name === newAchievement.name)) {
          updatedAchievements.push(newAchievement);
        }
        newCurrency += 100; // Example: 100 coins for a rare item
        toast.success(`User ${targetUserId} found the "${newAchievement.name}" and 100 Coins!`);
      } else if (rewardType === "Title") {
        const newAchievement: Achievement = {
          name: `Title: ${challengeName} Champion`,
          iconName: "Crown", // Use Crown icon for titles
          color: "bg-red-500", // A distinct color for titles
        };
        if (!updatedAchievements.some((a: Achievement) => a.name === newAchievement.name)) {
          updatedAchievements.push(newAchievement);
        }
        newCurrency += 150; // Example: 150 coins for a title
        toast.success(`User ${targetUserId} earned the "${newAchievement.name}" and 150 Coins!`);
      }
      // Add logic for other reward types (Rare Item, Title)

      const newLevel = calculateLevel(newExperience);

      const { error: rewardError } = await supabase
        .from('profiles')
        .update({
          experience: newExperience,
          currency: newCurrency, // Update currency
          achievements: updatedAchievements,
        })
        .eq('id', targetUserId);

      if (rewardError) {
        console.error("Error granting challenge rewards:", rewardError);
        toast.error("Failed to grant challenge rewards.");
      } else {
        // Only show a generic success if specific toasts weren't shown above
        if (rewardType === "Team XP") {
          toast.success(`Challenge "${challengeName}" completed and rewards granted to ${targetUserId}!`);
        }
        // Update current user's profile if it's the target user
        if (user?.id === targetUserId) {
          setProfile((prev) => prev ? { ...prev, experience: newExperience, level: newLevel, achievements: updatedAchievements, currency: newCurrency } : null);
        }
      }

      // If reward is Team XP and a teamId is provided, update team score
      if (rewardType === "Team XP" && teamId) {
        // This would ideally call a function from TeamContext to update team score
        // For now, we'll just log it. In a real app, you'd import useTeams and call addTeamScore.
        console.log(`Team ${teamId} would receive ${xpAmount} points for challenge ${challengeName}.`);
        // To actually update team score, you'd need to pass `addTeamScore` from TeamContext
        // or make a direct supabase call here (less ideal for context separation).
      }

    } else {
      toast.info(`Challenge "${challengeName}" marked as failed for ${targetUserId}.`);
    }
  }, [user, profile]);

  const submitChallengeCompletion = useCallback(async (challengeId: string, details: string, imageFile: File | null) => {
    if (!user) {
      throw new Error("User not authenticated.");
    }

    let completionEvidenceUrl: string | null = null;

    if (imageFile) {
      const fileExtension = imageFile.name.split('.').pop();
      const filePath = `${user.id}/challenge_completions/${challengeId}/${Date.now()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('challenge-completion-evidence') // Assuming a new bucket for challenge evidence
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('challenge-completion-evidence')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image.");
      }
      completionEvidenceUrl = publicUrlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('user_challenge_participation')
      .update({
        status: 'pending_review',
        completion_details: details,
        completion_evidence_url: completionEvidenceUrl,
      })
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId);

    if (updateError) {
      throw updateError;
    }
  }, [user]);


  const getAchievementIcon = useCallback((iconName: string) => {
    return LucideIconMap[iconName];
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, loadingProfile, addExperience, deductExperience, addCurrency, deductCurrency, addAchievement, updateProfileDetails, updateAvatar, uploadAvatar, getAchievementIcon, startQuest, completeQuest, submitImageForVerification, verifyQuestCompletion, grantChallengeReward, submitChallengeCompletion }}>
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