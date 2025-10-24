"use client";

import React, { useState } from "react";
import SnippetInput from "@/components/SnippetInput";
import GeneratedStoryDisplay from "@/components/GeneratedStoryDisplay";
import MoodSelector from "@/components/MoodSelector";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "sonner";

const StoryGenerator: React.FC = () => {
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState("Mystery"); // Default mood

  const generateMockStoryByMood = (snippet: string, mood: string): string => {
    switch (mood) {
      case "Mystery":
        return `Your day began with "${snippet}". What seemed like an ordinary event quickly turned into a perplexing mystery. A subtle detail, perhaps a misplaced item or an unusual sound, hinted at a hidden truth. You find yourself drawn into a web of secrets, where every clue leads to more questions, and the line between coincidence and conspiracy blurs. The real twist? The very thing you wrote about is the key to unlocking a long-forgotten enigma, and someone doesn't want it found.`;
      case "Fantasy":
        return `The mundane moment of "${snippet}" was actually a whisper from another realm. The air shimmered, and the world around you subtly shifted. You discover that your everyday life is merely a thin veil over a land of ancient magic, mythical creatures, and forgotten prophecies. Your snippet wasn't just a description; it was an unwitting incantation, opening a portal or awakening a dormant power within you. Now, you must embrace your destiny in a world far grander and more perilous than you ever imagined.`;
      case "Sci-Fi":
        return `The event you described: "${snippet}", triggered an unexpected anomaly. A glitch in the matrix, a ripple in the spacetime continuum, or perhaps a message from an advanced civilization. You realize your reality is not what it seems, and your snippet was a critical data point in a larger, futuristic narrative. You're now entangled in a high-tech conspiracy, a race against time to understand the true nature of your existence, or to prevent a catastrophic technological singularity.`;
      case "Romance":
        return `Amidst the ordinary day you described: "${snippet}", a spark of unexpected romance ignited. A chance encounter, a shared glance, or a simple act of kindness revealed a profound connection. What seemed like a normal moment became the prologue to a heartwarming love story, filled with charming coincidences and blossoming affection. The twist? The person you're meant to be with was closer than you ever realized, and your snippet was the universe's way of bringing you together.`;
      case "Comedy":
        return `Your day, as you put it: "${snippet}", spiraled into an utterly absurd comedy of errors. What started as a simple situation quickly escalated into a series of hilarious misunderstandings, awkward encounters, and unexpected slapstick. You find yourself in the most ridiculous predicaments, all stemming from that initial event. The twist? You're the unwitting star of a hidden camera show, or perhaps, the universe just has a very peculiar sense of humor when it comes to your life.`;
      case "Horror":
        return `The seemingly innocent event of "${snippet}" was merely the prelude to something truly terrifying. A creeping dread began to settle, as familiar surroundings twisted into something sinister. You realize that your snippet wasn't just a description of your day, but an unwitting invitation to a malevolent entity or a glimpse into a dark, unsettling truth. The twist? The horror isn't just outside; it's slowly, insidiously, becoming a part of you.`;
      case "Thriller":
        return `The moment you described: "${snippet}", was a critical turning point in a high-stakes thriller. What seemed innocuous was actually a coded message, a surveillance trigger, or a piece of a larger, dangerous puzzle. You're suddenly thrust into a world of espionage, betrayal, and relentless pursuit. The twist? You're not just an observer; you're a key player, and your snippet has put a target squarely on your back. Trust no one.`;
      case "Adventure":
        return `Your day, marked by "${snippet}", was actually the first step on an extraordinary adventure. A hidden map, a cryptic message, or a call to action emerged from the mundane. You discover that the world is far vaster and more exciting than you ever knew, filled with ancient ruins, daring quests, and untold treasures. The twist? Your snippet was the catalyst, revealing a path to a grand expedition, and you are the hero destined to embark upon it.`;
      default:
        return `Your day began with "${snippet}". What seemed like an ordinary moment quickly revealed itself to be the first domino in a chain of extraordinary events. A subtle shift in your perception, an unexpected discovery, or a strange coincidence hinted at a deeper narrative unfolding around you. You find yourself at the precipice of an unknown journey, where every turn reveals a new twist, and your initial snippet was merely the opening line to a story far grander than you could have imagined.`;
    }
  };

  const handleGenerateStory = (snippet: string, mood: string) => {
    setIsLoading(true);
    setGeneratedStory(null); // Clear previous story

    // Simulate API call for story generation
    setTimeout(() => {
      const mockStory = generateMockStoryByMood(snippet, mood);
      setGeneratedStory(mockStory);
      setIsLoading(false);
      toast.success("Your story has been generated!");
    }, 3000); // Simulate a 3-second API call
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-5xl font-extrabold text-center mb-8 text-gray-900 dark:text-white drop-shadow-lg">
        Fun AI-Powered Story Generator
      </h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8 w-full max-w-md">
        <MoodSelector selectedMood={selectedMood} onMoodChange={setSelectedMood} />
      </div>
      <SnippetInput onGenerateStory={handleGenerateStory} isLoading={isLoading} selectedMood={selectedMood} />
      <GeneratedStoryDisplay story={generatedStory} isLoading={isLoading} />
      <MadeWithDyad />
    </div>
  );
};

export default StoryGenerator;