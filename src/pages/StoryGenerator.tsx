"use client";

import React, { useState } from "react";
import SnippetInput from "@/components/SnippetInput";
import GeneratedStoryDisplay from "@/components/GeneratedStoryDisplay";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "sonner";

const StoryGenerator: React.FC = () => {
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateStory = (snippet: string) => {
    setIsLoading(true);
    setGeneratedStory(null); // Clear previous story

    // Simulate API call for story generation
    setTimeout(() => {
      const mockStory = `In a world where a simple coffee spill could unravel a conspiracy, our hero, armed with a mysterious old key, found themselves at the precipice of an ancient secret. The key, a relic from a forgotten era, hummed with an energy that hinted at untold power. Little did they know, the coffee stain on their laptop was not an accident, but a coded message, leading them on a thrilling chase through shadowy alleys and opulent ballrooms, all while a clandestine organization watched their every move. The fate of the world now rests on their ability to decipher the coffee code and unlock the truth before it's too late.`;
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
      <SnippetInput onGenerateStory={handleGenerateStory} isLoading={isLoading} />
      <GeneratedStoryDisplay story={generatedStory} isLoading={isLoading} />
      <MadeWithDyad />
    </div>
  );
};

export default StoryGenerator;