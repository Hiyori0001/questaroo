"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Compass, Search, List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import QuestList from "@/components/QuestList";
import QuestMapPlaceholder from "@/components/QuestMapPlaceholder";
import { toast } from "sonner"; // Import toast

// Dummy quests data (moved here for filtering logic)
interface Quest {
  id: string;
  title: string;
  description: string;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  timeEstimate: string;
}

const allDummyQuests: Quest[] = [
  {
    id: "q1",
    title: "The Whispering Woods Mystery",
    description: "Explore the old Whispering Woods and uncover the secret of the ancient tree. Requires keen observation!",
    location: "Central Park, New York",
    difficulty: "Medium",
    reward: "500 XP, 'Forest Explorer' Badge",
    timeEstimate: "30-45 min",
  },
  {
    id: "q2",
    title: "Downtown Scavenger Hunt",
    description: "Follow clues across the city center to find hidden landmarks and solve riddles.",
    location: "Downtown City Center",
    difficulty: "Hard",
    reward: "800 XP, 'Urban Pathfinder' Title",
    timeEstimate: "60-90 min",
  },
  {
    id: "q3",
    title: "Riverside Riddle Challenge",
    description: "A series of easy riddles located along the scenic riverside path. Perfect for a casual stroll.",
    location: "Riverside Promenade",
    difficulty: "Easy",
    reward: "250 XP, 'Riddle Solver' Badge",
    timeEstimate: "20-30 min",
  },
  {
    id: "q4",
    title: "Historic District Photo Op",
    description: "Visit historical sites and capture specific photos to complete this visual quest.",
    location: "Old Town Historic District",
    difficulty: "Medium",
    reward: "400 XP, 'History Buff' Achievement",
    timeEstimate: "45-60 min",
  },
  {
    id: "q5",
    title: "Museum Marvels Tour",
    description: "A quest through the city's finest museums, solving art and history puzzles.",
    location: "Museum Quarter, Cityville",
    difficulty: "Medium",
    reward: "600 XP, 'Culture Enthusiast' Badge",
    timeEstimate: "90-120 min",
  },
  {
    id: "q6",
    title: "Parkland Puzzle Pursuit",
    description: "Navigate through various parks, finding clues and completing nature-themed challenges.",
    location: "Green Valley Park",
    difficulty: "Easy",
    reward: "300 XP, 'Nature Lover' Achievement",
    timeEstimate: "40-50 min",
  },
];


const LocationQuests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All"); // New state for difficulty filter
  const [viewMode, setViewMode] = useState<"list" | "map">("list"); // 'list' or 'map'

  const handleFindNearbyQuests = () => {
    // Simulate finding nearby quests by filtering for 'Easy' difficulty
    setSelectedDifficulty("Easy");
    toast.info("Searching for nearby quests... showing easy quests for now!");
  };

  const filteredQuests = allDummyQuests.filter(
    (quest) =>
      (quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quest.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDifficulty === "All" || quest.difficulty === selectedDifficulty)
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-800 dark:to-gray-900 p-4">
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
              onClick={handleFindNearbyQuests} // Add onClick handler
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