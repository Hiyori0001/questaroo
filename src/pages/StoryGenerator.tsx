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
        return `A chilling ${mood.toLowerCase()} unfolds: ${snippet}. Our protagonist, a keen detective, discovers a hidden message within the spilled coffee, leading them to a clandestine society and a conspiracy far grander than imagined. The old key unlocks a forgotten vault, revealing secrets that could shake the city to its core. The air is thick with suspense, and every shadow hides a potential clue or danger.`;
      case "Fantasy":
        return `In a realm of ${mood.toLowerCase()} and ancient magic: ${snippet}. The coffee spill reveals a shimmering portal, and the old key is a relic of a forgotten kingdom. Our hero is thrust into an epic quest, battling mythical beasts and dark sorcerers, destined to restore balance to a world teetering on the brink of chaos. Whispers of dragons and enchanted forests fill the air.`;
      case "Sci-Fi":
        return `A ${mood.toLowerCase()} saga begins: ${snippet}. The coffee spill short-circuits a neural interface, downloading alien schematics into our hero's mind. The old key is a data chip, unlocking a starship's ancient navigation system. They must now pilot through asteroid fields and evade intergalactic empires to save humanity from an impending cosmic threat. Lasers and warp drives are their only companions.`;
      case "Romance":
        return `A heartwarming ${mood.toLowerCase()} blossoms: ${snippet}. The coffee spill leads to a charming encounter with a stranger, who helps clean up the mess. The old key belongs to a forgotten diary, revealing a poignant love story from the past that mirrors their own budding connection. Through shared laughter and unexpected moments, a beautiful new chapter begins.`;
      case "Comedy":
        return `A hilarious ${mood.toLowerCase()} of errors: ${snippet}. The coffee spill causes a chain reaction of absurd events, culminating in a public spectacle. The old key, it turns out, is for a forgotten locker containing a ridiculous costume, which our hero must wear to accidentally save the day. Expect slapstick, witty banter, and a truly unforgettable climax.`;
      case "Horror":
        return `A terrifying ${mood.toLowerCase()} descends: ${snippet}. The coffee spill reveals a grotesque stain that seems to writhe, and the old key vibrates with an ominous energy, beckoning our hero to a forbidden place. Shadows lengthen, whispers echo, and a malevolent presence stirs, eager to claim its next victim. Every creak and groan sends shivers down the spine.`;
      case "Thriller":
        return `A pulse-pounding ${mood.toLowerCase()} unfolds: ${snippet}. The coffee spill was no accident, but a deliberate distraction. The old key is a critical piece of evidence in a high-stakes game of espionage, forcing our hero into a desperate race against time to expose a shadowy organization before they can execute their deadly plan. Betrayal lurks around every corner.`;
      case "Adventure":
        return `An epic ${mood.toLowerCase()} awaits: ${snippet}. The coffee spill reveals a treasure map on the laptop screen, and the old key is the final piece to unlock a legendary artifact. Our hero embarks on a perilous journey across exotic lands, deciphering ancient riddles and outsmarting cunning rivals to claim their destiny. Swashbuckling action and daring escapes are guaranteed.`;
      default:
        return `In a world where a simple coffee spill could unravel a conspiracy, our hero, armed with a mysterious old key, found themselves at the precipice of an ancient secret. The key, a relic from a forgotten era, hummed with an energy that hinted at untold power. Little did they know, the coffee stain on their laptop was not an accident, but a coded message, leading them on a thrilling chase through shadowy alleys and opulent ballrooms, all while a clandestine organization watched their every move. The fate of the world now rests on their ability to decipher the coffee code and unlock the truth before it's too late. This story is infused with the spirit of ${mood}!`;
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