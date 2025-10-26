"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, X, RefreshCw } from "lucide-react"; // Import RefreshCw icon
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/UserProfileContext"; // Import useUserProfile

// Define the schema for profile editing
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not exceed 50 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

interface ProfileEditFormProps {
  initialData: {
    name: string;
    email: string;
  };
  onSave: (data: z.infer<typeof profileFormSchema>) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ initialData, onSave, onCancel }) => {
  const { updateAvatar } = useUserProfile(); // Use the new updateAvatar function
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    onSave(values);
    toast.success("Profile updated successfully!");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 dark:text-gray-200">Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 dark:text-gray-200">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={updateAvatar} // Call updateAvatar when this button is clicked
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Randomize Avatar
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ProfileEditForm;