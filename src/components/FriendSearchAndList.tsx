"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Search, UserPlus, Check, X, UserMinus, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/contexts/FriendContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserSearchResult {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string;
}

const FriendSearchAndList: React.FC = () => {
  const { user, loading: loadingAuth } = useAuth();
  const { friends, pendingRequests, sentRequests, loadingFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } = useFriends();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("friends");

  const handleSearch = useCallback(async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    if (!user) {
      toast.error("Please log in to search for users.");
      return;
    }

    setSearching(true);
    setSearchError(null);
    try {
      // Search profiles by first_name, last_name, or email
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, email') // Select email directly
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`); // Search by email too

      if (profilesError) {
        throw profilesError;
      }

      const results: UserSearchResult[] = profiles
        .filter(p => p.id !== user.id) // Exclude current user
        .map(p => ({
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          avatar_url: p.avatar_url,
          email: p.email || "Email not available", // Use email from profiles
        }));

      setSearchResults(results);
    } catch (err: any) {
      console.error("Error searching users:", err.message);
      setSearchError("Failed to search for users. Please try again.");
      toast.error("Failed to search for users.");
    } finally {
      setSearching(false);
    }
  }, [searchTerm, user]);

  const getFriendshipStatus = (targetUserId: string) => {
    if (!user) return "not_logged_in";

    const isFriend = friends.some(f => f.profiles.id === targetUserId);
    if (isFriend) return "friends";

    const isPendingSent = sentRequests.some(r => r.profiles.id === targetUserId);
    if (isPendingSent) return "request_sent";

    const isPendingReceived = pendingRequests.some(r => r.profiles.id === targetUserId);
    if (isPendingReceived) return "request_received";

    return "none";
  };

  const getFriendshipId = (targetUserId: string) => {
    const relationship = [...friends, ...pendingRequests, ...sentRequests].find(
      rel => (rel.user_id === user?.id && rel.friend_id === targetUserId) || (rel.user_id === targetUserId && rel.friend_id === user?.id)
    );
    return relationship?.id;
  };

  if (loadingAuth || loadingFriends) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-300">Loading friend data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-lg text-center">Please log in to manage friends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 font-heading">
            <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Find New Friends
          </CardTitle>
          <CardDescription className="text-md text-gray-700 dark:text-gray-300">
            Search for other Questaroo players by name or email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="sr-only">Search</span>
            </Button>
          </div>
          {searchError && <p className="text-red-500 text-sm text-center">{searchError}</p>}
          {searchResults.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white font-heading">Search Results:</h4>
              {searchResults.map((result) => {
                const status = getFriendshipStatus(result.id);
                return (
                  <div key={result.id} className="flex flex-col sm:flex-row items-center justify-between p-2 border rounded-md bg-gray-100 dark:bg-gray-700 gap-2 sm:gap-0"> {/* Added flex-col sm:flex-row and gap */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={result.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(result.id)}`} alt={`${result.first_name} ${result.last_name}`} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center sm:text-left"> {/* Centered text on mobile */}
                        <p className="font-medium text-gray-900 dark:text-white">{`${result.first_name || ''} ${result.last_name || ''}`.trim() || "Anonymous"}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{result.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0"> {/* Added margin top for mobile */}
                      {status === "none" && (
                        <Button size="sm" onClick={() => sendFriendRequest(result.id)}>
                          <UserPlus className="h-4 w-4 mr-1" /> Add Friend
                        </Button>
                      )}
                      {status === "request_sent" && (
                        <Button size="sm" variant="outline" disabled>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Request Sent
                        </Button>
                      )}
                      {status === "request_received" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => acceptFriendRequest(getFriendshipId(result.id)!)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectFriendRequest(getFriendshipId(result.id)!)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {status === "friends" && (
                        <Button size="sm" variant="secondary" disabled>
                          <Check className="h-4 w-4 mr-1" /> Friends
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {searchResults.length === 0 && searchTerm.trim() !== "" && !searching && (
            <p className="text-gray-500 dark:text-gray-400 text-center">No users found matching "{searchTerm}".</p>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 font-heading">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" /> Your Friends
              </CardTitle>
              <CardDescription className="text-md text-gray-700 dark:text-gray-300">
                Connect with your Questaroo companions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {friends.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">You don't have any friends yet. Send some requests!</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex flex-col sm:flex-row items-center justify-between p-2 border rounded-md bg-gray-100 dark:bg-gray-700 gap-2 sm:gap-0"> {/* Added flex-col sm:flex-row and gap */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={friend.profiles.avatar_url} alt={`${friend.profiles.first_name} ${friend.profiles.last_name}`} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-gray-900 dark:text-white">{`${friend.profiles.first_name} ${friend.profiles.last_name}`.trim()}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeFriend(friend.id)}>
                      <UserMinus className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 font-heading">
                <UserPlus className="h-6 w-6 text-orange-600 dark:text-orange-400" /> Pending Requests
              </CardTitle>
              <CardDescription className="text-md text-gray-700 dark:text-gray-300">
                Friend requests sent to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No pending friend requests.</p>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row items-center justify-between p-2 border rounded-md bg-gray-100 dark:bg-gray-700 gap-2 sm:gap-0"> {/* Added flex-col sm:flex-row and gap */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={request.profiles.avatar_url} alt={`${request.profiles.first_name} ${request.profiles.last_name}`} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-gray-900 dark:text-white">{`${request.profiles.first_name} ${request.profiles.last_name}`.trim()}</p>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0"> {/* Added margin top for mobile */}
                      <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                        <Check className="h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectFriendRequest(request.id)}>
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 font-heading">
                <UserPlus className="h-6 w-6 text-purple-600 dark:text-purple-400" /> Sent Requests
              </CardTitle>
              <CardDescription className="text-md text-gray-700 dark:text-gray-300">
                Friend requests you have sent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sentRequests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">You haven't sent any friend requests yet.</p>
              ) : (
                sentRequests.map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row items-center justify-between p-2 border rounded-md bg-gray-100 dark:bg-gray-700 gap-2 sm:gap-0"> {/* Added flex-col sm:flex-row and gap */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={request.profiles.avatar_url} alt={`${request.profiles.first_name} ${request.profiles.last_name}`} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-gray-900 dark:text-white">{`${request.profiles.first_name} ${request.profiles.last_name}`.trim()}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => removeFriend(request.id)}>
                      <X className="h-4 w-4 mr-1" /> Cancel Request
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendSearchAndList;