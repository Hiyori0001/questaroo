import { MapPin, Award, Zap, Clock } from "lucide-react";

export interface Quest {
  id: string;
  title: string;
  description: string;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  timeEstimate: string;
  completionTask?: { // Make completionTask optional
    question: string;
    answer: string;
  };
  qrCode?: string; // Add optional qrCode field
}

export const allDummyQuests: Quest[] = [
  {
    id: "q1",
    title: "The Whispering Woods Mystery",
    description: "Explore the old Whispering Woods and uncover the secret of the ancient tree. Requires keen observation!",
    location: "Central Park, New York",
    difficulty: "Medium",
    reward: "500 XP, 'Forest Explorer' Badge",
    timeEstimate: "30-45 min",
    completionTask: {
      question: "What color are the leaves of the ancient tree?",
      answer: "green",
    },
  },
  {
    id: "q2",
    title: "Downtown Scavenger Hunt",
    description: "Follow clues across the city center to find hidden landmarks and solve riddles.",
    location: "Downtown City Center",
    difficulty: "Hard",
    reward: "800 XP, 'Urban Pathfinder' Title",
    timeEstimate: "60-90 min",
    qrCode: "QUESTAROO-DT-789", // This will be the "QR code" to scan
  },
  {
    id: "q3",
    title: "Riverside Riddle Challenge",
    description: "A series of easy riddles located along the scenic riverside path. Perfect for a casual stroll.",
    location: "Riverside Promenade",
    difficulty: "Easy",
    reward: "250 XP, 'Riddle Solver' Badge",
    timeEstimate: "20-30 min",
    completionTask: {
      question: "How many bridges cross the river in this section?",
      answer: "3",
    },
  },
  {
    id: "q4",
    title: "Historic District Photo Op",
    description: "Visit historical sites and capture specific photos to complete this visual quest.",
    location: "Old Town Historic District",
    difficulty: "Medium",
    reward: "400 XP, 'History Buff' Achievement",
    timeEstimate: "45-60 min",
    completionTask: {
      question: "What year was the Old Clock Tower built?",
      answer: "1888",
    },
  },
  {
    id: "q5",
    title: "Museum Marvels Tour",
    description: "A quest through the city's finest museums, solving art and history puzzles.",
    location: "Museum Quarter, Cityville",
    difficulty: "Medium",
    reward: "600 XP, 'Culture Enthusiast' Badge",
    timeEstimate: "90-120 min",
    completionTask: {
      question: "What is the title of the famous painting in Gallery A?",
      answer: "starry night",
    },
  },
  {
    id: "q6",
    title: "Parkland Puzzle Pursuit",
    description: "Navigate through various parks, finding clues and completing nature-themed challenges.",
    location: "Green Valley Park",
    difficulty: "Easy",
    reward: "300 XP, 'Nature Lover' Achievement",
    timeEstimate: "40-50 min",
    completionTask: {
      question: "How many benches are around the central fountain?",
      answer: "5",
    },
  },
];