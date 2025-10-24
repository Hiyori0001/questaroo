"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const LocationQuests = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader>
          <MapPin className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Location-Based Quests
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Embark on real-world adventures! Discover quests by exploring your surroundings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed">
            This is where your journey begins. Soon, you'll be able to see available quests based on your current location,
            navigate to landmarks, and complete exciting challenges.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
              <Compass className="h-5 w-5 mr-2" /> Find Nearby Quests
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-500 dark:hover:bg-gray-600">
              <Search className="h-5 w-5 mr-2" /> Explore Map
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            (Feature coming soon: GPS integration and interactive map)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationQuests;