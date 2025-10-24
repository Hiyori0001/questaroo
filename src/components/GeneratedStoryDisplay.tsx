"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Import Button component
import { Copy } from "lucide-react"; // Import Copy icon
import { toast } from "sonner"; // Import toast for notifications

interface GeneratedStoryDisplayProps {
  story: string | null;
  isLoading: boolean;
}

const GeneratedStoryDisplay: React.FC<GeneratedStoryDisplayProps> = ({ story, isLoading }) => {
  const handleCopyStory = () => {
    if (story) {
      navigator.clipboard.writeText(story)
        .then(() => {
          toast.success("Story copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy story: ", err);
          toast.error("Failed to copy story.");
        });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Your Epic Story</CardTitle>
        {story && ( // Only show copy button if a story exists
          <Button variant="outline" size="sm" onClick={handleCopyStory} className="gap-1">
            <Copy className="h-4 w-4" />
            Copy Story
          </Button>
        )}
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