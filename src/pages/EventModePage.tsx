"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Trophy, Users, Clock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"; // Added CheckCircle2
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

interface CommunityChallenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_type: string;
  status: string;
}

interface UserChallengeParticipation {
  challenge_id: string;
  status: string;
}

const EventModePage = () => {
  const { user, loading: loadingAuth } = useAuth(); // Get user and loadingAuth from AuthContext
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityChallenge[]>([]);
  const [userParticipations, setUserParticipations] = useState<Set<string>>(new Set()); // Store IDs of challenges user has joined
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('community_challenges')
        .select('*')
        .gte('end_date', new Date().toISOString()) // Filter for events that haven't ended yet
        .order('start_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setUpcomingEvents(data as CommunityChallenge[]);
    } catch (err: any) {
      console.error("Error fetching community challenges:", err.message);
      setError("Failed to load community challenges. Please try again.");
      toast.error("Failed to load community challenges.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserParticipations = useCallback(async () => {
    if (!user) {
      setUserParticipations(new Set());
      return;
    }
    const { data, error } = await supabase
      .from('user_challenge_participation')
      .select('challenge_id, status')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching user participations:", error);
      // Don't block the page, just log error
    } else {
      const participated = new Set(data.map(p => p.challenge_id));
      setUserParticipations(participated);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
    if (!loadingAuth) {
      fetchUserParticipations();
    }
  }, [fetchEvents, fetchUserParticipations, loadingAuth]);

  const handleJoinChallenge = async (challengeId: string, challengeName: string) => {
    if (!user) {
      toast.error("You must be logged in to join a challenge.");
      return;
    }

    // Check if already joined (client-side check for quick feedback)
    if (userParticipations.has(challengeId)) {
      toast.info(`You have already joined "${challengeName}".`);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_challenge_participation')
        .insert({ user_id: user.id, challenge_id: challengeId, status: 'participating' });

      if (error) {
        console.error("Error joining challenge:", error);
        toast.error(`Failed to join "${challengeName}".`);
      } else {
        toast.success(`You have joined "${challengeName}"!`);
        setUserParticipations(prev => new Set(prev).add(challengeId)); // Update state
      }
    } catch (err: any) {
      console.error("Unhandled error joining challenge:", err.message);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleCommunityChallengesClick = () => {
    toast.info("This section now displays real community challenges from the database!");
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center mb-8">
        <CardHeader className="flex flex-col items-center">
          <CalendarDays className="h-16 w-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Event Mode
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Participate in timed community events and seasonal challenges!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed">
            Get ready for exciting limited-time events, special quests, and unique challenges with exclusive rewards.
            Check back here regularly to see what's new!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600" onClick={handleCommunityChallengesClick}>
              <Trophy className="h-5 w-5 mr-2" /> View Challenges
            </Button>
          </div>

          <div className="mt-8 text-left">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Upcoming Challenges</h3>
            {isLoading || loadingAuth ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400" />
                <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading challenges...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-32 text-red-600 dark:text-red-400">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-lg text-center">{error}</p>
                <Button onClick={fetchEvents} variant="link" className="mt-2 text-red-600 dark:text-red-400">
                  Retry
                </Button>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => {
                  const hasJoined = userParticipations.has(event.id);
                  return (
                    <Card key={event.id} className="bg-gray-50 dark:bg-gray-800 p-4 flex flex-col">
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{event.name}</CardTitle>
                      <CardDescription className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                        <CalendarDays className="h-4 w-4" /> {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                      </CardDescription>
                      <CardDescription className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" /> Status: {event.status}
                      </CardDescription>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 mb-3">
                        Reward: {event.reward_type}
                      </Badge>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-auto line-clamp-2">{event.description}</p>
                      <div className="mt-4">
                        {user ? (
                          <Button
                            onClick={() => handleJoinChallenge(event.id, event.name)}
                            disabled={hasJoined}
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                          >
                            {hasJoined ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Joined
                              </>
                            ) : (
                              <>
                                <Users className="h-4 w-4 mr-2" /> Join Challenge
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button disabled className="w-full">
                            Log in to Join
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-lg text-gray-500 dark:text-gray-400 text-center mt-8">No upcoming challenges found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventModePage;