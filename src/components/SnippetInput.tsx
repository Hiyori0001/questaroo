"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SnippetInputProps {
  onGenerateStory: (snippet: string) => void;
  isLoading: boolean;
}

const SnippetInput: React.FC<SnippetInputProps> = ({ onGenerateStory, isLoading }) => {
  const [snippet, setSnippet] = useState("");

  const handleSubmit = () => {
    if (snippet.trim()) {
      onGenerateStory(snippet);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Day's Snippet</CardTitle>
        <CardDescription>Tell me about your day, and I'll turn it into a movie-like plot twist!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., 'I spilled coffee on my laptop, then found a mysterious old key in my pocket.'"
          value={snippet}
          onChange={(e) => setSnippet(e.target.value)}
          rows={5}
          className="resize-none"
        />
        <Button onClick={handleSubmit} disabled={isLoading || !snippet.trim()} className="w-full">
          {isLoading ? "Generating..." : "Generate Story"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SnippetInput;