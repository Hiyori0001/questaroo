"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Compass, Search, List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuestList from "@/components/QuestList";
import QuestMapPlaceholder from "@/components/QuestMapPlaceholder";
import { toast } from "sonner";
import { allDummyQuests, Quest } from "@/data/quests";
import { useUserQuests } from "@/contexts/UserQuestsContext"; // Import useUserQuests

const LocationQuests = () => {
  const { userQuests, loadingUserQuests } = useUserQuests(); // Get user-created quests
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const handleFindNearbyQuests = () => {
    setSelectedDifficulty("Easy");
    toast.info("Searching for nearby quests... showing easy quests for now!");
  };

  // Combine dummy quests and user-created quests
  const allAvailableQuests = [...allDummyQuests, ...userQuests];

  const filteredQuests = allAvailableQuests.filter(
    (quest) =>
      (quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quest.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDifficulty === "All" || quest.difficulty === selectedDifficulty)
  );

  if (loadingUserQuests) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4 flex-grow">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading quests...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center mb-8">
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
            Explore the quests available near you or browse through exciting challenges.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              onClick={handleFindNearbyQuests}
            >
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

      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
            {viewMode === "list" ? "Available Quests" : "Quests Map View"}
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search quests by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow sm:max-w-xs"
            />
            <Select onValueChange={setSelectedDifficulty} value={selectedDifficulty}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {viewMode === "list" ? (
                <>
                  <Map className="h-5 w-5" />
                  <span className="sr-only">Switch to Map View</span>
                </>
              ) : (
                <>
                  <List className="h-5 w-5" />
                  <span className="sr-only">Switch to List View</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {viewMode === "list" ? (
          <QuestList quests={filteredQuests} />
        ) : (
          <QuestMapPlaceholder />
        )}
      </div>
    </div>
  );
};

export default LocationQuests;