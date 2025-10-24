"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface GeneratedStoryDisplayProps {
  story: string | null;
  isLoading: boolean;
}

const GeneratedStoryDisplay: React.FC<GeneratedStoryDisplayProps> = ({ story, isLoading }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Your Epic Story</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[280px]" />
            <Skeleton className="h-4 w-[220px]" />
          </div>
        ) : story ? (
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{story}</p>
        ) : (
          <p className="text-muted-foreground">Your cinematic masterpiece will appear here!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedStoryDisplay;