"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Friend {
  id: string; // ID of the friend relationship entry
  user_id: string; // ID of the user who sent the request
  friend_id: string; // ID of the user who received the request
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  // Profile details of the friend
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface FriendContextType {
  friends: Friend[];
  pendingRequests: Friend[]; // Requests received by the current user
  sentRequests: Friend[]; // Requests sent by the current user
  loadingFriends: boolean;
  sendFriendRequest: (friendId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
  fetchFriendData: () => Promise<void>;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export const FriendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: loadingAuth } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const fetchFriendData = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setLoadingFriends(false);
      return;
    }

    setLoadingFriends(true);
    try {
      // Fetch all friend relationships involving the current user
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          profiles:user_id(id, first_name, last_name, avatar_url),
          friend_profiles:friend_id(id, first_name, last_name, avatar_url)
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) {
        console.error("FriendContext: Error fetching friend data:", error.message, error.details);
        toast.error("Failed to load friend data.");
        return;
      }

      const allRelationships: Friend[] = data.map((rel: any) => {
        // Determine which profile is the 'friend' from the current user's perspective
        const friendProfile = rel.user_id === user.id ? rel.friend_profiles : rel.profiles;
        return {
          id: rel.id,
          user_id: rel.user_id,
          friend_id: rel.friend_id,
          status: rel.status,
          created_at: rel.created_at,
          profiles: {
            id: friendProfile.id,
            first_name: friendProfile.first_name || "Adventure",
            last_name: friendProfile.last_name || "Seeker",
            avatar_url: friendProfile.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(friendProfile.id)}`,
          },
        };
      });

      setFriends(allRelationships.filter(rel => rel.status === 'accepted'));
      setPendingRequests(allRelationships.filter(rel => rel.status === 'pending' && rel.friend_id === user.id));
      setSentRequests(allRelationships.filter(rel => rel.status === 'pending' && rel.user_id === user.id));

    } catch (error: any) {
      console.error("FriendContext: Unhandled error in fetchFriendData:", error.message);
      toast.error("An unexpected error occurred while fetching friend data.");
    } finally {
      setLoadingFriends(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loadingAuth) {
      fetchFriendData();
    }
  }, [user, loadingAuth, fetchFriendData]);

  const sendFriendRequest = useCallback(async (friendId: string) => {
    if (!user) {
      toast.error("You must be logged in to send friend requests.");
      return;
    }
    if (user.id === friendId) {
      toast.error("You cannot send a friend request to yourself.");
      return;
    }

    // Check if a request already exists or they are already friends
    const existingRelationship = [...friends, ...pendingRequests, ...sentRequests].find(
      rel => (rel.user_id === user.id && rel.friend_id === friendId) || (rel.user_id === friendId && rel.friend_id === user.id)
    );

    if (existingRelationship) {
      if (existingRelationship.status === 'pending') {
        if (existingRelationship.user_id === user.id) {
          toast.info("You have already sent a request to this user.");
        } else {
          toast.info("This user has already sent you a friend request. Check your pending requests!");
        }
      } else if (existingRelationship.status === 'accepted') {
        toast.info("You are already friends with this user.");
      }
      return;
    }

    const { error } = await supabase
      .from('friends')
      .insert({ user_id: user.id, friend_id: friendId, status: 'pending' });

    if (error) {
      console.error("FriendContext: Error sending friend request:", error.message, error.details);
      if (error.code === '23505') { // PostgreSQL unique_violation error code
        toast.error("A friend request with this user already exists or is pending.");
      } else {
        toast.error("Failed to send friend request: " + error.message);
      }
    } else {
      toast.success("Friend request sent!");
      fetchFriendData();
    }
  }, [user, friends, pendingRequests, sentRequests, fetchFriendData]);

  const acceptFriendRequest = useCallback(async (requestId: string) => {
    if (!user) {
      toast.error("You must be logged in to accept friend requests.");
      return;
    }

    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .eq('friend_id', user.id); // Ensure only the recipient can accept

    if (error) {
      console.error("FriendContext: Error accepting friend request:", error.message, error.details);
      toast.error("Failed to accept friend request.");
    } else {
      toast.success("Friend request accepted!");
      fetchFriendData();
    }
  }, [user, fetchFriendData]);

  const rejectFriendRequest = useCallback(async (requestId: string) => {
    if (!user) {
      toast.error("You must be logged in to reject friend requests.");
      return;
    }

    const { error } = await supabase
      .from('friends')
      .update({ status: 'rejected' }) // Or delete the entry
      .eq('id', requestId)
      .eq('friend_id', user.id); // Ensure only the recipient can reject

    if (error) {
      console.error("FriendContext: Error rejecting friend request:", error.message, error.details);
      toast.error("Failed to reject friend request.");
    } else {
      toast.info("Friend request rejected.");
      fetchFriendData();
    }
  }, [user, fetchFriendData]);

  const removeFriend = useCallback(async (friendshipId: string) => {
    if (!user) {
      toast.error("You must be logged in to remove friends.");
      return;
    }

    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`); // Ensure only one of the friends can delete

    if (error) {
      console.error("FriendContext: Error removing friend:", error.message, error.details);
      toast.error("Failed to remove friend.");
    } else {
      toast.info("Friend removed.");
      fetchFriendData();
    }
  }, [user, fetchFriendData]);

  return (
    <FriendContext.Provider value={{
      friends,
      pendingRequests,
      sentRequests,
      loadingFriends,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      removeFriend,
      fetchFriendData,
    }}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendContext);
  if (context === undefined) {
    throw new Error("useFriends must be used within a FriendProvider");
  }
  return context;
};