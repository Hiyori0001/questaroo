"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accessibility, Settings, Palette, Volume2, Text, Contrast } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const AccessibilityPage = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [largerText, setLargerText] = useState(false);
  const [audioVolume, setAudioVolume] = useState([50]); // Slider expects an array

  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
    toast.info(`High Contrast Mode: ${checked ? "Enabled" : "Disabled"}`);
  };

  const handleLargerTextChange = (checked: boolean) => {
    setLargerText(checked);
    toast.info(`Larger Text: ${checked ? "Enabled" : "Disabled"}`);
  };

  const handleAudioVolumeChange = (value: number[]) => {
    setAudioVolume(value);
    // Only show toast when the user stops dragging the slider
    // For simplicity, we'll show it on every change for now, but a debounce would be better
    // toast.info(`Audio Volume: ${value[0]}%`);
  };

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
            We are committed to making Questaroo accessible to all players. Adjust the settings below to customize your experience.
          </p>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-between gap-4 text-left p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Contrast className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <Label htmlFor="high-contrast" className="font-semibold text-gray-900 dark:text-white text-base">High Contrast Mode</Label>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Enhance color contrast for better readability.</p>
                </div>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={handleHighContrastChange}
              />
            </div>

            <div className="flex items-center justify-between gap-4 text-left p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Text className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <Label htmlFor="larger-text" className="font-semibold text-gray-900 dark:text-white text-base">Larger Text</Label>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Increase font sizes for easier reading.</p>
                </div>
              </div>
              <Switch
                id="larger-text"
                checked={largerText}
                onCheckedChange={handleLargerTextChange}
              />
            </div>

            <div className="flex flex-col gap-3 text-left p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <Label htmlFor="audio-volume" className="font-semibold text-gray-900 dark:text-white text-base">Audio Volume</Label>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Adjust the overall game audio level.</p>
                </div>
              </div>
              <Slider
                id="audio-volume"
                defaultValue={[50]}
                max={100}
                step={1}
                value={audioVolume}
                onValueChange={handleAudioVolumeChange}
                className="w-[90%] mx-auto mt-2"
              />
              <p className="text-sm text-muted-foreground text-center">{audioVolume[0]}%</p>
            </div>

            {/* Existing placeholder features, now with updated descriptions */}
            <div className="flex items-start gap-4 text-left p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
              <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Customizable Difficulty</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Adjust game challenges to match your skill level and preferences.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
              <Accessibility className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Inclusive Game Modes</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Different ways to play that cater to various physical and cognitive abilities.</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            (These controls are illustrative. Actual functionality will be implemented in future updates.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityPage;