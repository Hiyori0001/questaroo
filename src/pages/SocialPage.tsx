"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Share2, MessageSquareText } from "lucide-react";

const SocialPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-red-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <Share2 className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Connect & Share
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Your hub for social interaction and sharing your Plot Twist adventures!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <div className="flex items-center justify-center gap-4">
            <MessageSquareText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed">
              In-app chat for teammates and friends is coming soon! Coordinate quests, share tips, and celebrate victories together.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Share2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed">
              Share your achievements, quest stories, and game progress directly to your favorite social media platforms.
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            (Stay tuned for exciting updates on social features!)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPage;