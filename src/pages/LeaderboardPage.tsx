"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, User, Loader2, AlertCircle } from "lucide-react"; // Import Loader2 and AlertCircle
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase"; // Import supabase client
import { toast } from "sonner";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number; // This will map to experience
  avatarUrl: string;
}

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, experience')
        .order('experience', { ascending: false }) // Order by experience descending
        .limit(10); // Get top 10

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard. Please try again.");
        toast.error("Failed to load leaderboard.");
      } else {
        const formattedData: LeaderboardEntry[] = data.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Anonymous",
          score: profile.experience || 0,
          avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(profile.id)}`,
        }));
        setLeaderboardData(formattedData);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <Crown className="h-16 w-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Global Leaderboard
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            See who's at the top of the Questaroo world!
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500 dark:text-yellow-400" />
              <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 text-red-600 dark:text-red-400">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-lg text-center">{error}</p>
            </div>
          ) : leaderboardData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">Rank</TableHead>
                  <TableHead className="text-left">Player</TableHead>
                  <TableHead className="text-right">XP Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium text-center">
                      {index === 0 && <Crown className="inline-block h-5 w-5 text-yellow-500 mr-1" />}
                      {index + 1}
                    </TableCell>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.avatarUrl} alt={player.name} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{player.name}</span>
                    </TableCell>
                    <TableCell className="text-right text-gray-700 dark:text-gray-300">{player.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-lg text-gray-500 dark:text-gray-400 text-center mt-8">No players on the leaderboard yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;