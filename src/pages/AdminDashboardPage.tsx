"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin, Shield, Settings, Loader2, AlertCircle } from "lucide-react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import AdminUserManagement from "@/components/AdminUserManagement";
import AdminQuestManagement from "@/components/AdminQuestManagement";
import AdminTeamManagement from "@/components/AdminTeamManagement";

const AdminDashboardPage = () => {
  const { user, loading: loadingAuth } = useAuth();
  const { profile, loadingProfile } = useUserProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!loadingAuth && !loadingProfile) {
      if (!user || !profile?.isAdmin) {
        // If not logged in or not an admin, redirect to home or a forbidden page
        navigate("/");
        // Optionally show a toast
        // toast.error("Access Denied: You do not have administrative privileges.");
      }
    }
  }, [user, profile, loadingAuth, loadingProfile, navigate]);

  if (loadingAuth || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 flex-grow">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!user || !profile?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Access Denied
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center mb-8">
        <CardHeader className="flex flex-col items-center">
          <Settings className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Manage users, quests, and teams across Questaroo.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
              <TabsTrigger value="users" className="flex items-center justify-center gap-2 p-2">
                <Users className="h-5 w-5" /> Users
              </TabsTrigger>
              <TabsTrigger value="quests" className="flex items-center justify-center gap-2 p-2">
                <MapPin className="h-5 w-5" /> Quests
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center justify-center gap-2 p-2">
                <Shield className="h-5 w-5" /> Teams
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <AdminUserManagement />
            </TabsContent>
            <TabsContent value="quests">
              <AdminQuestManagement />
            </TabsContent>
            <TabsContent value="teams">
              <AdminTeamManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;