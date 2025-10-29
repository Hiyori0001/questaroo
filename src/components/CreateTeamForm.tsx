"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, X } from "lucide-react";
import { useTeams } from "@/contexts/TeamContext";

const createTeamFormSchema = z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 characters." }).max(50, { message: "Team name must not exceed 50 characters." }),
  description: z.string().max(200, { message: "Description must not exceed 200 characters." }).optional(),
});

interface CreateTeamFormProps {
  onClose: () => void;
}

const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ onClose }) => {
  const { createTeam } = useTeams();
  const form = useForm<z.infer<typeof createTeamFormSchema>>({
    resolver: zodResolver(createTeamFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof createTeamFormSchema>) => {
    await createTeam(values.name, values.description || "");
    onClose(); // Close the dialog after submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 dark:text-gray-200">Team Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., The Quest Avengers" {...field} />
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
              <FormLabel className="text-gray-800 dark:text-gray-200">Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description of your team's goals or vibe." className="resize-y min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
            <PlusCircle className="h-4 w-4 mr-2" /> Create Team
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateTeamForm;