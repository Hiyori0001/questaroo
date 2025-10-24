"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Star } from "lucide-react";

const ProfilePage = () => {
  // Placeholder user data - in a real app, this would come from an API
  const user = {
    name: "Adventure Seeker",
    email: "seeker@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=AdventureSeeker", // A fun placeholder avatar
    level: 5,
    experience: 1250,
    achievements: [
      { name: "First Quest Complete", icon: <Trophy className="h-4 w-4" />, color: "bg-yellow-500" },
      { name: "Trivia Master", icon: <Star className="h-4 w-4" />, color: "bg-blue-500" },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4 border-4 border-blue-500 dark:border-blue-400">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-3xl font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {user.name}
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{user.level}</p>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{user.experience} XP</p>
              <p className="text-sm text-muted-foreground">Experience</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Achievements</h3>
            {user.achievements.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-3">
                {user.achievements.map((achievement, index) => (
                  <Badge key={index} className={`px-4 py-2 text-base ${achievement.color} text-white flex items-center gap-2`}>
                    {achievement.icon} {achievement.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-md text-gray-700 dark:text-gray-300">No achievements yet. Keep playing!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;