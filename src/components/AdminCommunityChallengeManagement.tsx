"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added Card import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, PlusCircle, Edit, Trash2, CalendarDays, Trophy, Users, Upload, Image as ImageIcon, Eye } from "lucide-react"; // Added Users icon, Upload, ImageIcon
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AdminChallengeParticipantsDialog from "./AdminChallengeParticipantsDialog"; // Import new component

interface CommunityChallenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_type: string;
  status: string;
  created_at: string;
  completion_criteria: string | null;
  creator_reference_image_url: string | null; // New: Reference image URL
}

const challengeFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }).max(100, { message: "Name must not exceed 100 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description must not exceed 500 characters." }),
  start_date: z.date({ required_error: "Start date is required." }),
  end_date: z.date({ required_error: "End date is required." }),
  reward_type: z.string().min(1, { message: "Reward type is required." }),
  status: z.enum(["upcoming", "active", "completed"], { required_error: "Status is required." }),
  completion_criteria: z.string().min(10, { message: "Completion criteria must be at least 10 characters." }).max(500, { message: "Completion criteria must not exceed 500 characters." }).optional(),
  creatorReferenceImageFile: z.any().optional(), // New: For file input
}).superRefine((data, ctx) => {
  if (data.start_date && data.end_date && data.start_date > data.end_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date cannot be before start date.",
      path: ["end_date"],
    });
  }
});

const AdminCommunityChallengeManagement = () => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<CommunityChallenge | null>(null);

  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);
  const [selectedChallengeForParticipants, setSelectedChallengeForParticipants] = useState<CommunityChallenge | null>(null);

  const [selectedReferenceFile, setSelectedReferenceFile] = useState<File | null>(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState<string | null>(null);
  const [isUploadingReference, setIsUploadingReference] = useState(false);

  const form = useForm<z.infer<typeof challengeFormSchema>>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: undefined,
      end_date: undefined,
      reward_type: "Team XP",
      status: "upcoming",
      completion_criteria: "",
      creatorReferenceImageFile: undefined,
    },
  });

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('community_challenges')
      .select('*')
      .order('start_date', { ascending: true });

    if (fetchError) {
      console.error("Error fetching community challenges:", fetchError);
      setError("Failed to load community challenges.");
      toast.error("Failed to load community challenges.");
    } else {
      setChallenges(data as CommunityChallenge[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleReferenceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedReferenceFile(file);
      setReferencePreviewUrl(URL.createObjectURL(file));
      form.setValue("creatorReferenceImageFile", file); // Update form state
    } else {
      setSelectedReferenceFile(null);
      setReferencePreviewUrl(null);
      form.setValue("creatorReferenceImageFile", undefined);
    }
  };

  const handleCreateOrUpdateChallenge = async (values: z.infer<typeof challengeFormSchema>) => {
    setIsUploadingReference(true); // Use this for overall form submission loading
    try {
      let creatorReferenceImageUrl: string | null = editingChallenge?.creator_reference_image_url || null;

      if (selectedReferenceFile) {
        const fileExtension = selectedReferenceFile.name.split('.').pop();
        const filePath = `challenge_references/${editingChallenge?.id || Date.now()}.${fileExtension}`; // Use challenge ID if editing, else timestamp

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('challenge-reference-images')
          .upload(filePath, selectedReferenceFile, {
            cacheControl: '3600',
            upsert: true, // Overwrite if editing and re-uploading
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('challenge-reference-images')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error("Failed to get public URL for reference image.");
        }
        creatorReferenceImageUrl = publicUrlData.publicUrl;
      } else if (editingChallenge && !form.formState.dirtyFields.creatorReferenceImageFile) {
        // If no new file selected and not explicitly cleared, keep existing URL
        creatorReferenceImageUrl = editingChallenge.creator_reference_image_url;
      } else if (!selectedReferenceFile && form.formState.dirtyFields.creatorReferenceImageFile) {
        // If file input was cleared
        creatorReferenceImageUrl = null;
      }


      const challengeData = {
        name: values.name,
        description: values.description,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        reward_type: values.reward_type,
        status: values.status,
        completion_criteria: values.completion_criteria || null,
        creator_reference_image_url: creatorReferenceImageUrl, // Save the URL
      };

      if (editingChallenge) {
        // Update existing challenge
        const { error } = await supabase
          .from('community_challenges')
          .update(challengeData)
          .eq('id', editingChallenge.id);

        if (error) throw error;
        toast.success(`Challenge "${values.name}" updated successfully!`);
      } else {
        // Create new challenge
        const { error } = await supabase
          .from('community_challenges')
          .insert(challengeData);

        if (error) throw error;
        toast.success(`Challenge "${values.name}" created successfully!`);
      }
      form.reset();
      setSelectedReferenceFile(null);
      setReferencePreviewUrl(null);
      setEditingChallenge(null);
      setIsFormDialogOpen(false);
      fetchChallenges();
    } catch (err: any) {
      console.error("Error saving challenge:", err.message);
      toast.error("Failed to save challenge: " + err.message);
    } finally {
      setIsUploadingReference(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string, challengeName: string) => {
    setLoading(true);
    try {
      // First, delete all participations related to this challenge
      const { error: deleteParticipationError } = await supabase
        .from('user_challenge_participation')
        .delete()
        .eq('challenge_id', challengeId);

      if (deleteParticipationError) {
        console.error("Error deleting challenge participations:", deleteParticipationError);
        // Don't throw, try to delete the challenge itself anyway
      }

      const { error } = await supabase
        .from('community_challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;
      toast.success(`Challenge "${challengeName}" deleted successfully.`);
      fetchChallenges();
    } catch (err: any) {
      console.error("Error deleting challenge:", err.message);
      toast.error("Failed to delete challenge: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingChallenge(null);
    form.reset({
      name: "",
      description: "",
      start_date: undefined,
      end_date: undefined,
      reward_type: "Team XP",
      status: "upcoming",
      completion_criteria: "",
      creatorReferenceImageFile: undefined,
    });
    setSelectedReferenceFile(null);
    setReferencePreviewUrl(null);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (challenge: CommunityChallenge) => {
    setEditingChallenge(challenge);
    form.reset({
      name: challenge.name,
      description: challenge.description,
      start_date: new Date(challenge.start_date),
      end_date: new Date(challenge.end_date),
      reward_type: challenge.reward_type,
      status: challenge.status as "upcoming" | "active" | "completed",
      completion_criteria: challenge.completion_criteria || "",
      creatorReferenceImageFile: undefined, // Reset file input, but keep existing URL
    });
    setSelectedReferenceFile(null); // Clear selected file for edit
    setReferencePreviewUrl(challenge.creator_reference_image_url); // Show existing image
    setIsFormDialogOpen(true);
  };

  const openParticipantsDialog = (challenge: CommunityChallenge) => {
    setSelectedChallengeForParticipants(challenge);
    setIsParticipantsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading challenges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p className="text-lg text-center">{error}</p>
        <Button onClick={fetchChallenges} variant="link" className="mt-2 text-red-600 dark:text-red-400">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              <PlusCircle className="h-4 w-4 mr-2" /> Create New Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white font-heading">{editingChallenge ? "Edit Community Challenge" : "Create New Community Challenge"}</DialogTitle>
              <DialogDescription className="text-gray-700 dark:text-gray-300">
                {editingChallenge ? "Update the details of this challenge." : "Fill in the details for your new community challenge."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateOrUpdateChallenge)} className="space-y-4 py-4">
                {/* Scrollable area for form fields */}
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Challenge Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Spring Scavenger Hunt" {...field} />
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
                        <FormLabel className="text-gray-800 dark:text-gray-200">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the challenge and its objectives." className="resize-y min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-gray-800 dark:text-gray-200">Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-gray-800 dark:text-gray-200">End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="reward_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Reward Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reward type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Team XP">Team XP</SelectItem>
                            <SelectItem value="Exclusive Badge">Exclusive Badge</SelectItem>
                            <SelectItem value="Rare Item">Rare Item</SelectItem>
                            <SelectItem value="Title">Title</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="completion_criteria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-200">Completion Criteria</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Complete 3 'Easy' quests in Central Park, or achieve 500 clicks in the Clicker Challenge." className="resize-y min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* New: Creator Reference Image Upload */}
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Reference Image (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleReferenceFileChange}
                        disabled={isUploadingReference}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload an image to serve as a visual reference for this challenge.
                    </FormDescription>
                    <FormMessage />
                    {(referencePreviewUrl || editingChallenge?.creator_reference_image_url) && (
                      <div className="mt-2 flex justify-center">
                        <img src={referencePreviewUrl || editingChallenge?.creator_reference_image_url || ''} alt="Reference Preview" className="max-w-full h-48 object-contain rounded-md border dark:border-gray-700" />
                      </div>
                    )}
                  </FormItem>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4"> {/* Changed to flex-col-reverse on mobile */}
                  <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)} disabled={isUploadingReference} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploadingReference} className="w-full sm:w-auto">
                    {isUploadingReference ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {editingChallenge ? "Update Challenge" : "Create Challenge"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Name</TableHead><TableHead className="text-left">Description</TableHead><TableHead className="text-center">Start Date</TableHead><TableHead className="text-center">End Date</TableHead><TableHead className="text-center">Reward</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-left">Criteria</TableHead><TableHead className="text-center">Reference Image</TableHead><TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell className="font-medium text-gray-800 dark:text-gray-200">{challenge.name}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300 line-clamp-2 max-w-xs">{challenge.description}</TableCell>
                <TableCell className="text-center text-gray-700 dark:text-gray-300">{format(new Date(challenge.start_date), "PPP")}</TableCell>
                <TableCell className="text-center text-gray-700 dark:text-gray-300">{format(new Date(challenge.end_date), "PPP")}</TableCell>
                <TableCell className="text-center text-gray-700 dark:text-gray-300">{challenge.reward_type}</TableCell>
                <TableCell className="text-center text-gray-700 dark:text-gray-300">{challenge.status}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300 line-clamp-2 max-w-xs">{challenge.completion_criteria || "N/A"}</TableCell>
                <TableCell className="text-center">
                  {challenge.creator_reference_image_url ? (
                    <a href={challenge.creator_reference_image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      <ImageIcon className="h-5 w-5 mx-auto" />
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(challenge)} disabled={loading} className="w-full sm:w-auto">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openParticipantsDialog(challenge)} disabled={loading} className="w-full sm:w-auto">
                      <Users className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={loading} className="w-full sm:w-auto">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-white font-heading">Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                            Are you sure you want to delete challenge "{challenge.name}"? This will also delete all associated user participations. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteChallenge(challenge.id, challenge.name)} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedChallengeForParticipants && (
        <AdminChallengeParticipantsDialog
          isOpen={isParticipantsDialogOpen}
          onClose={() => setIsParticipantsDialogOpen(false)}
          challenge={selectedChallengeForParticipants}
          onChallengeUpdated={fetchChallenges} // Callback to refresh challenges after participant actions
        />
      )}
    </div>
  );
};

export default AdminCommunityChallengeManagement;