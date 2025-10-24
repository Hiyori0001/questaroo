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
        return `The day started with a clumsy coffee spill on your laptop: "${snippet}". But as you wiped the screen, a faint, almost invisible inscription appeared, revealing coordinates. The mysterious old key in your pocket, which you'd never seen before, perfectly fit a hidden lockbox at those coordinates. Inside, a single, cryptic note read: "They know you're looking." Suddenly, your ordinary day has become a thrilling chase to uncover a secret society's ancient truth, and you're the unwitting protagonist.`;
      case "Fantasy":
        return `Your mundane morning took a turn when you spilled coffee on your laptop: "${snippet}". The liquid shimmered, revealing an ancient map etched onto the screen, pointing to a forgotten realm. The mysterious old key in your pocket, warm to the touch, pulsed with a faint magic. It's not just a key; it's a relic, and the coffee spill was a magical summons. You are now destined to embark on an epic quest, guided by the map and the key, to awaken a sleeping dragon or perhaps, to seal a dark rift threatening both your world and the one beyond.`;
      case "Sci-Fi":
        return `A routine coffee spill on your laptop: "${snippet}". But the spill short-circuited something, causing the screen to flicker with alien symbols. The mysterious old key in your pocket, sleek and metallic, suddenly activated, projecting a holographic message: "Initiate contact. Earth is ready." You realize the coffee wasn't just coffee; it was a catalyst, and the key is a communication device. You've accidentally triggered humanity's first contact with an advanced civilization, and now you're at the center of an intergalactic diplomatic mission, or perhaps, a looming invasion.`;
      case "Romance":
        return `Your day began with a clumsy coffee spill on your laptop: "${snippet}". Embarrassed, you rushed to a nearby cafe for napkins, bumping into a charming stranger who insisted on helping. As you cleaned up, the mysterious old key in your pocket slipped out. The stranger recognized it instantly – it was a key to their grandmother's antique shop, a place filled with forgotten love stories. This chance encounter, sparked by a simple spill, has now opened the door to an unexpected connection, a shared past, and a blossoming romance.`;
      case "Comedy":
        return `You managed to spill coffee all over your laptop: "${snippet}". In a panic, you tried to clean it, only to discover the mysterious old key in your pocket was actually a novelty bottle opener shaped like a tiny, angry badger. The "spill" was actually a perfectly timed prank by your eccentric neighbor, who then burst in, demanding you use the badger key to open a bottle of "celebratory" sparkling cider. Your day has devolved into an absurd, hilarious series of misunderstandings, all thanks to a caffeinated catastrophe and a very peculiar key.`;
      case "Horror":
        return `The coffee spill on your laptop was just the beginning: "${snippet}". As the dark liquid spread, it formed an unsettling, almost sentient pattern on the screen. The mysterious old key in your pocket grew cold, then began to vibrate, emitting a faint, guttural whisper. It's not just a key; it's a conduit. The spill wasn't an accident; it was an invitation. You've inadvertently opened a gateway to something ancient and malevolent, and the key is now drawing you towards a place where shadows move on their own and sanity unravels.`;
      case "Thriller":
        return `Your morning took a sharp turn with a coffee spill on your laptop: "${snippet}". As you frantically cleaned, you noticed a micro-SD card taped beneath the mysterious old key in your pocket. The card contained encrypted files detailing a high-stakes corporate espionage plot, and your "spill" was a pre-arranged signal. You're not just an ordinary person; you're a sleeper agent, activated by a seemingly mundane event. Now, you're in a race against time, with shadowy figures closing in, to expose the conspiracy before it's too late.`;
      case "Adventure":
        return `A simple coffee spill on your laptop: "${snippet}". But as the liquid seeped into the keyboard, it revealed a hidden compartment containing a faded parchment – a treasure map! The mysterious old key in your pocket, heavy and ornate, perfectly matched a symbol on the map. This wasn't just a spill; it was a call to adventure. You're now on the cusp of a grand expedition, following ancient clues and deciphering riddles, to uncover a legendary artifact or a lost civilization, with danger and discovery around every corner.`;
      default:
        return `Your day started with a simple coffee spill on your laptop: "${snippet}". But as you cleaned, you found a mysterious old key in your pocket that you don't remember ever owning. This seemingly ordinary event is the first domino in a chain of extraordinary circumstances. The key hums with an unknown energy, hinting at a hidden purpose. Little do you know, this key is the missing piece to a puzzle that will unravel a long-forgotten secret, leading you on an unexpected journey where every turn reveals a new twist.`;
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