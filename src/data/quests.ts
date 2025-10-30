import { MapPin, Award, Zap, Clock } from "lucide-react";

export interface Quest {
  id: string;
  title: string;
  description: string;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  timeEstimate: string;
  timeLimit?: string; // Add optional timeLimit field
  completionTask?: {
    question: string;
    answer: string;
  };
  qrCode?: string;
  completionImagePrompt?: string; // New: Prompt for image verification
  user_id?: string; // Add optional user_id to track the creator
  latitude?: number; // New: Latitude for map
  longitude?: number; // New: Longitude for map
  verificationRadius?: number; // New: Optional radius for location verification in meters
  creatorReferenceImageUrl?: string; // New: URL for creator's reference image
}

export const allDummyQuests: Quest[] = [
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", // Generated UUID
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
    latitude: 40.785091, // Example coordinate for Central Park
    longitude: -73.968285,
    verificationRadius: 50, // Example: 50 meters radius
  },
  {
    id: "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e", // Generated UUID
    title: "Downtown Scavenger Hunt",
    description: "Follow clues across the city center to find hidden landmarks and solve riddles.",
    location: "Downtown City Center",
    difficulty: "Hard",
    reward: "800 XP, 'Urban Pathfinder' Title",
    timeEstimate: "60-90 min",
    qrCode: "QUESTAROO-DT-789", // This will be the "QR code" to scan
    latitude: 34.0437, // Example coordinate for LA downtown
    longitude: -118.2645,
    verificationRadius: 100, // Example: 100 meters radius
  },
  {
    id: "c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f", // Generated UUID
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
    latitude: 34.0000, // Example coordinate for LA riverside
    longitude: -118.2000,
    verificationRadius: 20, // Example: 20 meters radius
  },
  {
    id: "d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a", // Generated UUID
    title: "Historic District Photo Op",
    description: "Visit historical sites and capture specific photos to complete this visual quest.",
    location: "Old Town Historic District",
    difficulty: "Medium",
    reward: "400 XP, 'History Buff' Achievement",
    timeEstimate: "45-60 min",
    completionImagePrompt: "Take a photo of the Old Clock Tower.", // Example image prompt
    latitude: 34.0500, // Example coordinate for LA historic
    longitude: -118.2500,
    verificationRadius: 75, // Example: 75 meters radius
  },
  {
    id: "e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b", // Generated UUID
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
    latitude: 34.0600, // Example coordinate for LA museum
    longitude: -118.2800,
    verificationRadius: 30, // Example: 30 meters radius
  },
  {
    id: "f5a6b7c8-d9e0-1f2a-3b4c-5d6e7f8a9b0c", // Generated UUID
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
    latitude: 34.0800, // Example coordinate for LA park
    longitude: -118.3000,
    verificationRadius: 40, // Example: 40 meters radius
  },
];