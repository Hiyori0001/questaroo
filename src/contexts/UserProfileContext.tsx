"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { LucideIcon, Trophy, Star } from "lucide-react";

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
  name: string;
  email: string;
  avatarUrl: string;
  level: number;
  experience: number;
  achievements: Achievement[];
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loadingProfile: boolean;
  addExperience: (xp: number) => void;
  addAchievement: (achievement: Achievement) => void;
  updateProfileDetails: (name: string, email: string) => void;
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

  const defaultProfile = useCallback((email: string, userId: string): UserProfile => ({
    name: "Adventure Seeker",
    email: email,
    avatarUrl: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(userId)}`,
    level: 1,
    experience: 0,
    achievements: [],
  }), []);

  // Load profile when user changes
  useEffect(() => {
    if (loadingAuth) {
      setLoadingProfile(true);
      return;
    }

    if (user) {
      const storedProfile = localStorage.getItem(`questarooUserProfile_${user.id}`);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        // Create a new profile if none exists for this user
        const newProfile = defaultProfile(user.email || "unknown@example.com", user.id);
        setProfile(newProfile);
        localStorage.setItem(`questarooUserProfile_${user.id}`, JSON.stringify(newProfile));
      }
    } else {
      setProfile(null); // No user, no profile
    }
    setLoadingProfile(false);
  }, [user, loadingAuth, defaultProfile]);

  // Save profile to local storage whenever it changes
  useEffect(() => {
    if (user && profile) {
      localStorage.setItem(`questarooUserProfile_${user.id}`, JSON.stringify(profile));
    }
  }, [profile, user]);

  const addExperience = useCallback((xp: number) => {
    setProfile((prevProfile) => {
      if (!prevProfile) return null;

      const newExperience = prevProfile.experience + xp;
      const newLevel = calculateLevel(newExperience);

      if (newLevel > prevProfile.level) {
        toast.success(`Level Up! You are now Level ${newLevel}!`);
      } else {
        toast.info(`+${xp} XP!`);
      }

      return {
        ...prevProfile,
        experience: newExperience,
        level: newLevel,
      };
    });
  }, []);

  const addAchievement = useCallback((newAchievement: Achievement) => {
    setProfile((prevProfile) => {
      if (!prevProfile) return null;

      // Check if achievement already exists
      if (prevProfile.achievements.some(a => a.name === newAchievement.name)) {
        toast.info(`Achievement "${newAchievement.name}" already earned!`);
        return prevProfile;
      }

      toast.success(`Achievement Unlocked: ${newAchievement.name}!`);
      return {
        ...prevProfile,
        achievements: [...prevProfile.achievements, newAchievement],
      };
    });
  }, []);

  const updateProfileDetails = useCallback((name: string, email: string) => {
    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        name,
        email,
        avatarUrl: `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}`,
      };
    });
  }, []);

  const getAchievementIcon = useCallback((iconName: string) => {
    return LucideIconMap[iconName];
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, loadingProfile, addExperience, addAchievement, updateProfileDetails, getAchievementIcon }}>
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