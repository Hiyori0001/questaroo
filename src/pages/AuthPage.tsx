"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/lib/supabase"; // Import supabase client

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/profile");
      toast.info("You are already logged in.");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader>
          <LogIn className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Questaroo!
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Sign in or sign up to start your adventure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers specified
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))', // Use your primary color
                    brandAccent: 'hsl(var(--primary-foreground))', // Use your primary-foreground color
                  },
                },
              },
            }}
            theme="light" // Use light theme
            redirectTo={window.location.origin + "/profile"} // Redirect to profile page after auth
            view="magic_link" // Explicitly set view to magic_link
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;