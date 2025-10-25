"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, MapPin } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(100, { message: "Title must not exceed 100 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(500, { message: "Description must not exceed 500 characters." }),
  location: z.string().min(3, { message: "Location must be at least 3 characters." }).max(100, { message: "Location must not exceed 100 characters." }),
});

const CreateQuestPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Quest submitted:", values);
    toast.success("Quest submitted successfully! It will be reviewed.");
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