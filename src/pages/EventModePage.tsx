"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const EventModePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <CalendarDays className="h-16 w-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Event Mode
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Participate in timed community events and seasonal challenges!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed">
            Get ready for exciting limited-time events, special quests, and unique challenges with exclusive rewards.
            Check back here regularly to see what's new!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
              <Trophy className="h-5 w-5 mr-2" /> View Upcoming Events
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-500 dark:hover:bg-gray-600">
              <Users className="h-5 w-5 mr-2" /> Community Challenges
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            (Event schedule and details coming soon!)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventModePage;