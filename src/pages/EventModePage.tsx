"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Trophy, Users, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Import toast

interface Event {
  id: string;
  name: string;
  date: string;
  type: string;
  reward: string;
}

// Dummy data for events
const dummyEvents: Event[] = [
  {
    id: "e1",
    name: "Spring Scavenger Hunt",
    date: "April 15 - April 22",
    type: "Location Quest",
    reward: "Exclusive Badge",
  },
  {
    id: "e2",
    name: "Weekly Trivia Challenge",
    date: "Every Friday",
    type: "Mini-Game",
    reward: "Bonus XP",
  },
  {
    id: "e3",
    name: "Community Photo Contest",
    date: "May 1 - May 15",
    type: "Creative Challenge",
    reward: "Rare Item",
  },
  {
    id: "e4",
    name: "Summer Festival Quest",
    date: "July 1 - July 15",
    type: "Location Quest",
    reward: "Summer Crown",
  },
  {
    id: "e5",
    name: "Autumn Puzzle Marathon",
    date: "October 1 - October 7",
    type: "Mini-Game",
    reward: "Puzzle Master Title",
  },
];

const EventModePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      // Removed random error simulation for a more consistent demo experience
      setUpcomingEvents(dummyEvents);
      setIsLoading(false);
    }, 1500); // Simulate network delay
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCommunityChallengesClick = () => {
    toast.info("Community Challenges are coming soon! Stay tuned for exciting team events.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
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
            <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
              <Trophy className="h-5 w-5 mr-2" /> View Upcoming Events
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg font-semibold border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-500 dark:hover:bg-gray-600"
              onClick={handleCommunityChallengesClick} // Added onClick handler
            >
              <Users className="h-5 w-5 mr-2" /> Community Challenges
            </Button>
          </div>

          <div className="mt-8 text-left">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Upcoming Events</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400" />
                <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading events...</p>
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
                      <CalendarDays className="h-4 w-4" /> {event.date}
                    </CardDescription>
                    <CardDescription className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" /> Type: {event.type}
                    </CardDescription>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                      Reward: {event.reward}
                    </Badge>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-lg text-gray-500 dark:text-gray-400 text-center mt-8">No upcoming events found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventModePage;