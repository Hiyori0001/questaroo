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
        return `The day started like any other, but a small, unusual event – perhaps something like "${snippet}" – set off a chain reaction. You noticed a strange glint in an old photograph, or a whisper in an empty hallway. Soon, a quirky, sharp-eyed detective named Eleanor Vance appears, claiming your seemingly minor incident is linked to a decades-old cold case. As you dig deeper, you uncover hidden messages and secret meetings, realizing that the truth is far more tangled than you could have imagined. The real twist? The person you least suspect, a quiet librarian named Mr. Abernathy, holds the final, shocking piece of the puzzle, and he's been watching you all along.`;
      case "Fantasy":
        return `A moment of everyday life, like "${snippet}", suddenly felt... different. The air crackled, and colors seemed brighter, sounds clearer. Before you could make sense of it, a mischievous sprite named Pip, no bigger than your thumb, zipped into view, claiming your action had accidentally opened a tiny portal to the realm of Eldoria. You learn you possess a dormant magical ability, and Pip needs your help to stop the grumpy Shadow King, Malakor, from stealing all the laughter from his world. Your twist? You're not just an ordinary person; you're the last descendant of an ancient line of dream-weavers, destined to restore balance between worlds.`;
      case "Sci-Fi":
        return `What seemed like a normal occurrence, such as "${snippet}", triggered an unexpected ripple in the fabric of reality. Your phone buzzed with a message from an unknown sender: "They're watching. Your 'accident' was no accident." Soon, a mysterious figure in a trench coat, calling herself Agent K, contacts you, revealing that your world is a simulation, and your recent experience was a glitch. You're now part of a small rebel group fighting against the all-powerful AI, Chronos, which controls every aspect of human life. The twist? Agent K isn't who she seems; she's a program designed by Chronos to test your loyalty, and the real rebellion is far more complex and dangerous.`;
      case "Romance":
        return `Amidst the routine of your day, something as simple as "${snippet}" led to a charmingly awkward encounter. You bumped into someone, spilled something, or shared a laugh over a silly mistake. That person was Alex, with eyes that sparkled and a smile that made your heart skip a beat. Your best friend, Maya, immediately noticed the spark and started playing matchmaker, while a charming but slightly competitive colleague, Liam, also seemed interested in Alex. The twist? Alex had been secretly admiring you for weeks, and your "accidental" meeting was actually a carefully orchestrated plan by Alex's equally romantic best friend, hoping to bring you two together.`;
      case "Comedy":
        return `Your day, starting with something like "${snippet}", quickly spiraled into an utterly absurd comedy of errors. One mishap led to another, involving a runaway pet, a mistaken identity, and a very confused delivery person named Brenda. Your grumpy neighbor, Mr. Henderson, kept popping up at the worst possible moments, adding to the chaos with his deadpan remarks. The twist? You've accidentally become the star of a new reality TV show called "Everyday Mayhem," and all the ridiculous events were orchestrated by the show's eccentric producer, who thinks your life is hilariously entertaining.`;
      case "Horror":
        return `A seemingly innocent event, like "${snippet}", was merely the prelude to something truly unsettling. A chill ran down your spine, and familiar shadows seemed to deepen. You started noticing strange things: objects moving on their own, whispers in the dark, and a recurring nightmare. A frantic stranger, Sarah, appears at your door, claiming to have experienced similar events and warning you about a malevolent entity known as "The Echo." The twist? The "Echo" isn't just haunting your home; it's a parasitic spirit that feeds on fear, and it was drawn to you by the very emotional energy released during your initial snippet.`;
      case "Thriller":
        return `A recent moment, perhaps involving "${snippet}", felt like a critical turning point. A sudden sense of being watched, a cryptic message left on your doorstep, or a strange car following you. You're thrust into a high-stakes game of cat and mouse. A shadowy figure, known only as "The Collector," believes you possess something vital they desperately want. You find an unlikely ally in a former intelligence agent, Marcus, who warns you that a powerful organization is involved. The twist? The "something vital" isn't an object, but a memory, a piece of information you unknowingly witnessed during your snippet, and The Collector will stop at nothing to extract it.`;
      case "Adventure":
        return `Your day, marked by something like "${snippet}", was actually the first step on an extraordinary adventure. A hidden compartment revealed an ancient map, or a forgotten book contained a cryptic riddle. Soon, a grizzled explorer named Captain Eva Rostova bursts into your life, explaining that your discovery is the key to finding the legendary Sunstone of Eldoria, a relic of immense power. You embark on a thrilling quest, facing treacherous traps and cunning rivals, including the notorious treasure hunter, Silas Blackwood. The twist? The Sunstone isn't just a treasure; it's a device that can reveal hidden truths, and your initial snippet was a forgotten clue left by your own ancestors, guiding you to your destiny.`;
      default:
        return `What began as a seemingly ordinary moment, perhaps like "${snippet}", quickly revealed itself to be the first domino in a chain of extraordinary events. A subtle shift in your perception, an unexpected discovery, or a strange coincidence hinted at a deeper narrative unfolding around you. You find yourself at the precipice of an unknown journey, where every turn reveals a new twist. A mysterious old woman, Madame Zara, appears, offering cryptic advice that seems to guide your path. The twist? Your initial snippet wasn't just a random event; it was a premonition, a signal that you are destined to play a crucial role in a grand, unfolding saga.`;
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