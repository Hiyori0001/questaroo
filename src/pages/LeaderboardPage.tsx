"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  avatarUrl: string;
}

const leaderboardData: LeaderboardEntry[] = [
  { id: "1", name: "QuestMaster", score: 5200, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=QuestMaster" },
  { id: "2", name: "TriviaKing", score: 4800, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=TriviaKing" },
  { id: "3", name: "ExplorerPro", score: 4500, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=ExplorerPro" },
  { id: "4", name: "PuzzleSolver", score: 4100, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=PuzzleSolver" },
  { id: "5", name: "MapMaven", score: 3900, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=MapMaven" },
  { id: "6", name: "ChallengeChamp", score: 3750, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=ChallengeChamp" },
  { id: "7", name: "RiddleRacer", score: 3500, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=RiddleRacer" },
  { id: "8", name: "AdventureAce", score: 3200, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=AdventureAce" },
  { id: "9", name: "Pathfinder", score: 3000, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Pathfinder" },
  { id: "10", name: "Legendary", score: 2800, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Legendary" },
];

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">Rank</TableHead>
                <TableHead className="text-left">Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;