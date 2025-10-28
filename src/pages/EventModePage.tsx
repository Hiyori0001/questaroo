"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Trophy, Users, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Import toast
import { supabase } from "@/lib/supabase"; // Import supabase

interface CommunityChallenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_type: string;
  status: string;
}

const EventModePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityChallenge[]>([]);
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

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
            {/* The "Community Challenges" button is now repurposed to show a toast, as the section below directly displays them. */}
            {/* <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg font-semibold border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-500 dark:hover:bg-gray-600"
              onClick={handleCommunityChallengesClick}
            >
              <Users className="h-5 w-5 mr-2" /> Community Challenges
            </Button> */}
          </div>

          <div className="mt-8 text-left">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Upcoming Challenges</h3>
            {isLoading ? (
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
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="bg-gray-50 dark:bg-gray-800 p-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{event.name}</CardTitle>
                    <CardDescription className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                      <CalendarDays className="h-4 w-4" /> {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                    </CardDescription>
                    <CardDescription className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" /> Status: {event.status}
                    </CardDescription>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                      Reward: {event.reward_type}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{event.description}</p>
                  </Card>
                ))}
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