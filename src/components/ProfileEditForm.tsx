"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, X, RefreshCw, Upload, Loader2 } from "lucide-react"; // Import Upload and Loader2 icons
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/UserProfileContext"; // Import useUserProfile
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components

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
  const { profile, updateAvatar, uploadAvatar } = useUserProfile(); // Use the new updateAvatar and uploadAvatar functions
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    onSave(values);
    // toast.success("Profile updated successfully!"); // Toast is now handled by onSave in ProfilePage
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file to upload.");
      return;
    }
    setIsUploading(true);
    try {
      await uploadAvatar(selectedFile);
      setSelectedFile(null); // Clear selected file after upload
    } catch (error) {
      console.error("Error during avatar upload:", error);
      // toast.error is already handled by uploadAvatar
    } finally {
      setIsUploading(false);
    }
  };

  // Check if the user has unlocked the Avatar Randomizer
  const hasAvatarRandomizer = profile?.achievements.some(
    (a) => a.name === "Avatar Randomizer Unlocked"
  );

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

        {/* Avatar Upload Section */}
        <div className="space-y-2 pt-4 border-t dark:border-gray-700">
          <FormLabel className="text-gray-800 dark:text-gray-200">Change Avatar</FormLabel>
          <div className="flex flex-col sm:flex-row gap-3 items-center"> {/* Changed to flex-col on mobile */}
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-grow"
              disabled={isUploading}
            />
            <Button
              type="button"
              onClick={handleUploadAvatar}
              disabled={!selectedFile || isUploading}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Upload Avatar
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload your own image or randomize your avatar below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-3"> {/* Changed to flex-col on mobile, added gap */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                onClick={updateAvatar} // Call updateAvatar when this button is clicked
                className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={isUploading || !hasAvatarRandomizer} // Disable if not purchased
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Randomize Avatar
              </Button>
            </TooltipTrigger>
            {!hasAvatarRandomizer && (
              <TooltipContent>
                <p>Purchase "Avatar Randomizer" from the shop to enable this feature.</p>
              </TooltipContent>
            )}
          </Tooltip>
          <div className="flex gap-3 w-full sm:w-auto"> {/* Ensure buttons take full width on mobile */}
            <Button type="button" variant="outline" onClick={onCancel} className="flex-grow dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600" disabled={isUploading}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" className="flex-grow bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={isUploading}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ProfileEditForm;