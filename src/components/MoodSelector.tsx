"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MoodSelectorProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

const moods = [
  "Mystery",
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Comedy",
  "Horror",
  "Thriller",
  "Adventure",
];

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodChange }) => {
  return (
    <div className="space-y-2 w-full max-w-md mx-auto">
      <Label htmlFor="mood-select">Choose a Mood</Label>
      <Select value={selectedMood} onValueChange={onMoodChange}>
        <SelectTrigger id="mood-select" className="w-full">
          <SelectValue placeholder="Select a mood" />
        </SelectTrigger>
        <SelectContent>
          {moods.map((mood) => (
            <SelectItem key={mood} value={mood}>
              {mood}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MoodSelector;