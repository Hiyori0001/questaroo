"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Team {
  id: string;
  name: string;
  description: string;
  members: number;
  score: number;
  avatarUrl: string;
}

const teamsData: Team[] = [
  { id: "1", name: "The Quest Seekers", description: "Dedicated to finding every hidden quest.", members: 8, score: 15200, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=QuestSeekers" },
  { id: "2", name: "Puzzle Masters", description: "Solving riddles and cracking codes.", members: 6, score: 12800, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=PuzzleMasters" },
  { id: "3", name: "Urban Explorers", description: "Mapping out the city, one landmark at a time.", members: 10, score: 18500, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=UrbanExplorers" },
  { id: "4", name: "Trivia Titans", description: "Unbeatable in knowledge challenges.", members: 7, score: 11000, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=TriviaTitans" },
  { id: "5", name: "Adventure Alliance", description: "A group of fearless adventurers.", members: 12, score: 20100, avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=AdventureAlliance" },
];

const TeamsPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <Users className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Teams & Community
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Join forces with other players and conquer challenges together in Questaroo!
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Team</TableHead>
                <TableHead className="text-left">Description</TableHead>
                <TableHead className="text-center">Members</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamsData.sort((a, b) => b.score - a.score).map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={team.avatarUrl} alt={team.name} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        <Shield className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{team.name}</span>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{team.description}</TableCell>
                  <TableCell className="text-center text-gray-700 dark:text-gray-300">{team.members}</TableCell>
                  <TableCell className="text-right text-gray-700 dark:text-gray-300 flex items-center justify-end">
                    <Trophy className="h-4 w-4 text-yellow-500 mr-1" /> {team.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamsPage;