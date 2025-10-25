"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const { signIn, signUp, loading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/profile");
      toast.info("You are already logged in.");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "") {
      toast.error("Please enter your email address.");
      return;
    }

    if (isLogin) {
      await signIn(email);
    } else {
      await signUp(email);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader>
          {isLogin ? (
            <LogIn className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          ) : (
            <UserPlus className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          )}
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isLogin ? "Welcome Back!" : "Join Questaroo!"}
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            {isLogin ? "Sign in to continue your adventure." : "Create an account to start your journey."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-gray-800 dark:text-gray-200 text-left">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center text-lg"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Send Magic Link" : "Sign Up"}
            </Button>
          </form>
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Button>
          <p className="text-sm text-muted-foreground">
            (We use email magic links for a password-less experience.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;