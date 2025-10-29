"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";

const QuestMapPlaceholder = () => {
  return (
    <Card className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg shadow-inner border-dashed border-2 border-gray-300 dark:border-gray-600">
      <CardContent className="flex flex-col items-center justify-center text-center p-6">
        <Map className="h-20 w-20 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2 font-heading">
          Interactive Map Coming Soon!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Imagine seeing quests pop up on a map based on your real-world location.
        </p>
      </CardContent>
    </Card>
  );
};

export default QuestMapPlaceholder;