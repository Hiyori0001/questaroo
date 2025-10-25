"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accessibility, Settings, Palette, Volume2 } from "lucide-react";

const AccessibilityPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <Accessibility className="h-16 w-16 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Accessibility Options
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Ensuring Questaroo is enjoyable and accessible for everyone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed">
            We are committed to making Questaroo accessible to all players. Our goal is to provide a flexible and inclusive experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 text-left">
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Customizable Difficulty</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Adjust game challenges to match your skill level and preferences.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Visual Adjustments</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Options for high-contrast modes, larger text, and colorblind-friendly palettes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <Volume2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Audio Cues & Transcripts</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Alternative audio cues and text transcripts for important in-game information.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <Accessibility className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Inclusive Game Modes</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Different ways to play that cater to various physical and cognitive abilities.</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            (More accessibility features and detailed settings will be implemented in future updates.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityPage;