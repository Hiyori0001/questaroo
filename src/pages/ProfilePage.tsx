"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Star, Edit, Users, Shield, DollarSign } from "lucide-react"; // Import DollarSign icon

import { Button } from "@/components/ui/button";
import ProfileEditForm from "@/components/ProfileEditForm";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTeams } from "@/contexts/TeamContext"; // Import useTeams
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { profile, loadingProfile, updateProfileDetails, getAchievementIcon } = useUserProfile();
  const { user, loading: loadingAuth } = useAuth();
  const { userTeam, loadingUserTeam } = useTeams(); // Get userTeam from TeamContext
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Redirect to auth page if not logged in and not loading
  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/auth");
    }
  }, [user, loadingAuth, navigate]);

  if (loadingAuth || loadingProfile || loadingUserTeam || !profile) { // Include loadingUserTeam
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const handleSaveProfile = (updatedData: { name: string; email: string }) => {
    updateProfileDetails(updatedData.name, updatedData.email);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center relative">
          <Avatar className="h-24 w-24 mb-4 border-4 border-blue-500 dark:border-blue-400">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-3xl font-bold">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {profile.name}
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            {profile.email}
          </CardDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-5 w-5" />
            <span className="sr-only">Edit Profile</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          {isEditing ? (
            <ProfileEditForm
              initialData={{ name: profile.name, email: profile.email }}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{profile.level}</p>
                  <p className="text-sm text-muted-foreground">Level</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{profile.experience} XP</p>
                  <p className="text-sm text-muted-foreground">Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" /> {profile.currency}
                  </p>
                  <p className="text-sm text-muted-foreground">Coins</p>
                </div>
              </div>

              {userTeam && (
                <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 shadow-sm">
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center justify-center gap-2">
                    <Shield className="h-6 w-6" /> Your Team: {userTeam.name}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">{userTeam.description}</p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm flex items-center justify-center gap-1 mt-2">
                    <Trophy className="h-4 w-4 text-yellow-500" /> Team Score: {userTeam.score}
                  </p>
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Achievements</h3>
                {profile.achievements.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-3">
                    {profile.achievements.map((achievement, index) => {
                      const IconComponent = getAchievementIcon(achievement.iconName);
                      return (
                        <Badge key={index} className={`px-4 py-2 text-base ${achievement.color} text-white flex items-center gap-2`}>
                          {IconComponent && <IconComponent className="h-4 w-4" />} {achievement.name}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-md text-gray-700 dark:text-gray-300">No achievements yet. Keep playing!</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;