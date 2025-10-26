"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { PlusCircle, MapPin, QrCode, HelpCircle, LocateFixed } from "lucide-react"; // Added LocateFixed icon
import { toast } from "sonner";
import { useUserQuests } from "@/contexts/UserQuestsContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Quest } from "@/data/quests";

// Define the schema for quest creation
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(100, { message: "Title must not exceed 100 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(500, { message: "Description must not exceed 500 characters." }),
  location: z.string().min(3, { message: "Location must be at least 3 characters." }).max(100, { message: "Location must not exceed 100 characters." }),
  latitude: z.number().min(-90, { message: "Latitude must be between -90 and 90." }).max(90, { message: "Latitude must be between -90 and 90." }).optional(),
  longitude: z.number().min(-180, { message: "Longitude must be between -180 and 180." }).max(180, { message: "Longitude must be between -180 and 180." }).optional(),
  verificationRadius: z.number().min(1, { message: "Radius must be at least 1 meter." }).max(1000, { message: "Radius must not exceed 1000 meters." }).optional(), // New: verificationRadius
  timeLimit: z.string().optional(),
  completionMethod: z.enum(["question", "qrCode", "location"], { // Added 'location'
    required_error: "Please select a completion method.",
  }),
  completionQuestion: z.string().optional(),
  completionAnswer: z.string().optional(),
  qrCode: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.completionMethod === "question") {
    if (!data.completionQuestion || data.completionQuestion.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Completion question is required for 'Question' method.",
        path: ["completionQuestion"],
      });
    }
    if (!data.completionAnswer || data.completionAnswer.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Completion answer is required for 'Question' method.",
        path: ["completionAnswer"],
      });
    }
  } else if (data.completionMethod === "qrCode") {
    if (!data.qrCode || data.qrCode.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "QR Code is required for 'QR Code' method.",
        path: ["qrCode"],
      });
    }
  } else if (data.completionMethod === "location") { // New validation for location method
    if (data.latitude === undefined || data.longitude === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude and Longitude are required for 'Location' method.",
        path: ["latitude"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude and Longitude are required for 'Location' method.",
        path: ["longitude"],
      });
    }
    if (data.verificationRadius === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Verification Radius is required for 'Location' method.",
        path: ["verificationRadius"],
      });
    }
  }
});

const CreateQuestPage = () => {
  const { addQuest } = useUserQuests();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      latitude: undefined,
      longitude: undefined,
      verificationRadius: undefined,
      timeLimit: "",
      completionMethod: "question",
      completionQuestion: "",
      completionAnswer: "",
      qrCode: "",
    },
  });

  const selectedCompletionMethod = form.watch("completionMethod");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newQuest: Quest = {
      id: `user-quest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: values.title,
      description: values.description,
      location: values.location,
      difficulty: "Medium",
      reward: "User-Created XP",
      timeEstimate: "Variable",
      timeLimit: values.timeLimit || undefined,
      latitude: values.latitude,
      longitude: values.longitude,
      verificationRadius: values.verificationRadius, // Add verificationRadius
    };

    if (values.completionMethod === "question" && values.completionQuestion && values.completionAnswer) {
      newQuest.completionTask = {
        question: values.completionQuestion,
        answer: values.completionAnswer,
      };
    } else if (values.completionMethod === "qrCode" && values.qrCode) {
      newQuest.qrCode = values.qrCode;
    }
    // No specific completionTask or qrCode needed for 'location' method, as it uses lat/lon/radius

    addQuest(newQuest);
    form.reset();
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader>
          <PlusCircle className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Own Quest
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Design a new adventure for others to discover and enjoy!
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Quest Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Mystery of the Old Oak" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Quest Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the quest, its story, and what players need to do..."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Location (e.g., Park Name, City)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Central Park, New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 dark:text-gray-200">Latitude (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 34.0522"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Geographic coordinate for the quest location.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 dark:text-gray-200">Longitude (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., -118.2437"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Geographic coordinate for the quest location.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* New Time Limit Field */}
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Time Limit (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 30 minutes, 1 hour" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify a strict time limit for completing this quest.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completionMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Quest Completion Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select how users complete this quest" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="question">Question & Answer</SelectItem>
                        <SelectItem value="qrCode">QR Code Scan</SelectItem>
                        <SelectItem value="location">Location Verification</SelectItem> {/* New option */}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how players will verify completion of your quest.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCompletionMethod === "question" && (
                <>
                  <FormField
                    control={form.control}
                    name="completionQuestion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" /> Completion Question
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., What color is the statue's hat?" {...field} />
                        </FormControl>
                        <FormDescription>
                          A question whose answer can only be found at the quest location.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="completionAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Correct Answer</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Red" {...field} />
                        </FormControl>
                        <FormDescription>
                          The exact answer players must provide (case-insensitive).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedCompletionMethod === "qrCode" && (
                <FormField
                  control={form.control}
                  name="qrCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <QrCode className="h-4 w-4" /> QR Code for Verification
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., QUEST-CODE-XYZ" {...field} />
                      </FormControl>
                      <FormDescription>
                        This code will be used to verify quest completion. It will NOT be visible to other players.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedCompletionMethod === "location" && ( // New fields for location verification
                <>
                  <p className="text-sm text-muted-foreground">
                    For location verification, ensure you've provided Latitude and Longitude above.
                  </p>
                  <FormField
                    control={form.control}
                    name="verificationRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <LocateFixed className="h-4 w-4" /> Verification Radius (meters)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 50"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                            value={field.value === undefined ? "" : field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          The maximum distance (in meters) a player can be from the quest coordinates to complete it.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                <PlusCircle className="h-4 w-4 mr-2" /> Submit Quest
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuestPage;