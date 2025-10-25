"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Quest } from "@/data/quests"; // Import the Quest interface

interface UserQuestsContextType {
  userQuests: Quest[];
  loadingUserQuests: boolean;
  addQuest: (newQuest: Quest) => void;
}

const UserQuestsContext = createContext<UserQuestsContextType | undefined>(undefined);

export const UserQuestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingAuth } = useAuth();
  const [userQuests, setUserQuests] = useState<Quest[]>([]);
  const [loadingUserQuests, setLoadingUserQuests] = useState(true);

  // Load user quests from local storage when user changes or on mount
  useEffect(() => {
    if (loadingAuth) {
      setLoadingUserQuests(true);
      return;
    }

    if (user) {
      const storedQuests = localStorage.getItem(`questarooUserQuests_${user.id}`);
      if (storedQuests) {
        setUserQuests(JSON.parse(storedQuests));
      } else {
        setUserQuests([]);
      }
    } else {
      setUserQuests([]); // Clear quests if no user is logged in
    }
    setLoadingUserQuests(false);
  }, [user, loadingAuth]);

  // Save user quests to local storage whenever they change
  useEffect(() => {
    if (user && userQuests.length > 0) {
      localStorage.setItem(`questarooUserQuests_${user.id}`, JSON.stringify(userQuests));
    } else if (user && userQuests.length === 0) {
      // If quests become empty, clear from local storage
      localStorage.removeItem(`questarooUserQuests_${user.id}`);
    }
  }, [userQuests, user]);

  const addQuest = useCallback((newQuest: Quest) => {
    setUserQuests((prevQuests) => {
      const updatedQuests = [...prevQuests, newQuest];
      toast.success(`Quest "${newQuest.title}" created successfully!`);
      return updatedQuests;
    });
  }, []);

  return (
    <UserQuestsContext.Provider value={{ userQuests, loadingUserQuests, addQuest }}>
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