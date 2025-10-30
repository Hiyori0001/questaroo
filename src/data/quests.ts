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
  is_predefined?: boolean; // New: Flag to indicate if quest is predefined
}

// allDummyQuests are now stored in the 'predefined_quests' table in Supabase.
// This file now only defines the Quest interface.