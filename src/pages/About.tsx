"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, MapPin, Gamepad2, Users, Lightbulb, Award, Share2, CalendarDays, Accessibility } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Location-Based Quests",
    description: "Unlock quests by visiting local landmarks, parks, or hidden spots. GPS integration powers real-world adventure.",
  },
  {
    icon: Gamepad2,
    title: "Mini-Games and Challenges",
    description: "Includes trivia, puzzles, timed tasks, creative challenges (like photo or video missions), and AR games for immersive fun.",
  },
  {
    icon: Users,
    title: "Team & Community Play",
    description: "Form groups to compete in challenges and earn group rewards or badges. Leaderboards for friendly competition.",
  },
  {
    icon: Lightbulb,
    title: "User-Generated Content",
    description: "Players can create and share their own quests and mini-games for others to try.",
  },
  {
    icon: Award,
    title: "Progression & Rewards",
    description: "Leveling system with experience points, collectibles, cosmetics, and virtual currency to customize avatars or unlock special content.",
  },
  {
    icon: Share2,
    title: "Social Sharing & Chat",
    description: "Share achievements or quest stories within the app or on social media, plus in-app chat for teammates.",
  },
  {
    icon: CalendarDays,
    title: "Event Mode",
    description: "Hosts timed community events or seasonal challenges to keep the app engaging over time.",
  },
  {
    icon: Accessibility,
    title: "Accessibility Options",
    description: "Customizable difficulty, different game modes, and inclusive accessibility settings to ensure broad appeal.",
  },
];

const About = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto py-12">
        <Card className="bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 sm:p-10 mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Welcome to Questaroo!
            </CardTitle>
            <CardDescription className="text-xl text-gray-700 dark:text-gray-300">
              Your ultimate mobile/web app that combines real-world exploration with digital games and fun challenges.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center mt-6">
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              Get ready for an immersive experience where you complete quests and mini-games based on your location, interests, or group activities. It’s like a mix of a scavenger hunt, trivia, and casual games with social and creative elements!
            </p>
          </CardContent>
        </Card>

        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          What’s Inside
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white dark:bg-gray-700 shadow-lg rounded-lg p-6 flex flex-col items-center text-center">
              <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                {feature.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;