"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Share2, MessageSquareText, Twitter, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
            Your hub for social interaction and sharing your Questaroo adventures!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 mt-6">
          {/* In-app Chat Placeholder */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageSquareText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Team Chat (Coming Soon!)</h3>
            </div>
            <div className="h-32 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm italic mb-4">
              Chat messages will appear here...
            </div>
            <div className="flex gap-2">
              <Input placeholder="Type your message..." disabled />
              <Button disabled>Send</Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Social Sharing Placeholder */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Share2 className="h-7 w-7 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Share Your Adventures!</h3>
            </div>
            <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
              Share your latest quest achievements and game progress with friends on social media.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="icon" disabled>
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" disabled>
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" disabled>
                <Instagram className="h-5 w-5" />
              </Button>
              <Button disabled>Copy Link</Button>
            </div>
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