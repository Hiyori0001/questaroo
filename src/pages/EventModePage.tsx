"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Trophy, Users, Clock, Loader2, AlertCircle, CheckCircle2, MessageSquareText } from "lucide-react"; // Added MessageSquareText
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import ChallengeCompletionSubmitter from "@/components/ChallengeCompletionSubmitter"; // Import new component

interface CommunityChallenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_type: string;
  status: string;
  completion_criteria: string | null; // Added new field
}

interface UserChallengeParticipation {
  challenge_id: string;
  status: 'participating' | 'pending_review' | 'completed' | 'withdrawn' | 'failed'; // Updated status types
}

const EventModePage = () => {
  const { user, loading: loadingAuth } = useAuth(); // Get user and loadingAuth from AuthContext
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityChallenge[]>([]);
  const [userParticipations, setUserParticipations] = useState<Map<string, UserChallengeParticipation>>(new Map()); // Store full participation objects
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitterOpen, setIsSubmitterOpen] = useState(false);
  const [selectedChallengeForSubmission, setSelectedChallengeForSubmission] = useState<CommunityChallenge | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('community_challenges')
        .select('*')
        .or('status.eq.upcoming,status.eq.active') // Only show upcoming or active challenges
        .gte('end_date', new Date().toISOString()) // And ensure they haven't ended yet
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
      setUserParticipations(new Map());
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
      const participationsMap = new Map(data.map(p => [p.challenge_id, p as UserChallengeParticipation]));
      setUserParticipations(participationsMap);
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
        // Update state with the new participation
        setUserParticipations(prev => new Map(prev).set(challengeId, { challenge_id: challengeId, status: 'participating' }));
      }
    } catch (err: any) {
      console.error("Unhandled error joining challenge:", err.message);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleOpenSubmitter = (challenge: CommunityChallenge) => {
    if (!user) {
      toast.error("You must be logged in to submit challenge completion.");
      return;
    }
    const participation = userParticipations.get(challenge.id);
    if (!participation || participation.status !== 'participating') {
      toast.error("You can only submit for challenges you are actively participating in.");
      return;
    }
    setSelectedChallengeForSubmission(challenge);
    setIsSubmitterOpen(true);
  };

  const handleSubmissionSuccess = () => {
    fetchUserParticipations(); // Re-fetch participations to update status
  };

  const getStatusBadge = (status: UserChallengeParticipation['status']) => {
    switch (status) {
      case 'participating':
        return <Badge variant="outline" className="border-blue-500 text-blue-500 dark:border-blue-700 dark:text-blue-300 flex items-center justify-center gap-1"><Users className="h-4 w-4" /> Participating</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-500 dark:bg-yellow-700 text-white flex items-center justify-center gap-1"><MessageSquareText className="h-4 w-4" /> Pending Review</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 dark:bg-green-700 text-white flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4" /> Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 dark:bg-red-700 text-white flex items-center justify-center gap-1"><XCircle className="h-4 w-4" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
                  const participation = userParticipations.get(event.id);
                  const hasJoined = !!participation;
                  const isPendingReview = participation?.status === 'pending_review';
                  const isCompleted = participation?.status === 'completed';
                  const isFailed = participation?.status === 'failed';

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
                      {event.completion_criteria && ( // Display completion criteria
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                          <span className="font-semibold">Objective:</span> {event.completion_criteria}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-auto line-clamp-2">{event.description}</p>
                      <div className="mt-4">
                        {user ? (
                          <>
                            {!hasJoined && (
                              <Button
                                onClick={() => handleJoinChallenge(event.id, event.name)}
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                              >
                                <Users className="h-4 w-4 mr-2" /> Join Challenge
                              </Button>
                            )}
                            {hasJoined && !isCompleted && !isFailed && !isPendingReview && (
                              <Button
                                onClick={() => handleOpenSubmitter(event)}
                                className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                              >
                                <MessageSquareText className="h-4 w-4 mr-2" /> Submit Completion
                              </Button>
                            )}
                            {hasJoined && (isPendingReview || isCompleted || isFailed) && (
                              <div className="w-full text-center">
                                {getStatusBadge(participation.status)}
                              </div>
                            )}
                          </>
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

      {selectedChallengeForSubmission && (
        <ChallengeCompletionSubmitter
          isOpen={isSubmitterOpen}
          onClose={() => setIsSubmitterOpen(false)}
          challengeId={selectedChallengeForSubmission.id}
          challengeName={selectedChallengeForSubmission.name}
          completionCriteria={selectedChallengeForSubmission.completion_criteria}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default EventModePage;