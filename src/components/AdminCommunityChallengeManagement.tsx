"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, PlusCircle, Edit, Trash2, CalendarDays, Trophy } from "lucide-react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CommunityChallenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_type: string;
  status: string;
  created_at: string;
  completion_criteria: string | null; // Added new field
}

const challengeFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }).max(100, { message: "Name must not exceed 100 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description must not exceed 500 characters." }),
  start_date: z.date({ required_error: "Start date is required." }),
  end_date: z.date({ required_error: "End date is required." }),
  reward_type: z.string().min(1, { message: "Reward type is required." }),
  status: z.enum(["upcoming", "active", "completed"], { required_error: "Status is required." }),
  completion_criteria: z.string().min(10, { message: "Completion criteria must be at least 10 characters." }).max(500, { message: "Completion criteria must not exceed 500 characters." }).optional(), // New field
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

  const form = useForm<z.infer<typeof challengeFormSchema>>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: undefined,
      end_date: undefined,
      reward_type: "Team XP",
      status: "upcoming",
      completion_criteria: "", // Initialize new field
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

  const handleCreateOrUpdateChallenge = async (values: z.infer<typeof challengeFormSchema>) => {
    setLoading(true);
    try {
      const challengeData = {
        name: values.name,
        description: values.description,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        reward_type: values.reward_type,
        status: values.status,
        completion_criteria: values.completion_criteria || null, // Include new field
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
      setEditingChallenge(null);
      setIsFormDialogOpen(false);
      fetchChallenges();
    } catch (err: any) {
      console.error("Error saving challenge:", err.message);
      toast.error("Failed to save challenge: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string, challengeName: string) => {
    setLoading(true);
    try {
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
      completion_criteria: "", // Reset new field
    });
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
      completion_criteria: challenge.completion_criteria || "", // Set new field
    });
    setIsFormDialogOpen(true);
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
              <DialogTitle className="text-gray-900 dark:text-white">{editingChallenge ? "Edit Community Challenge" : "Create New Community Challenge"}</DialogTitle>
              <DialogDescription className="text-gray-700 dark:text-gray-300">
                {editingChallenge ? "Update the details of this challenge." : "Fill in the details for your new community challenge."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateOrUpdateChallenge)} className="space-y-4 py-4">
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
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
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
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Description</TableHead>
              <TableHead className="text-center">Start Date</TableHead>
              <TableHead className="text-center">End Date</TableHead>
              <TableHead className="text-center">Reward</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-left">Criteria</TableHead> {/* New column */}
              <TableHead className="text-center">Actions</TableHead>
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
                <TableCell className="text-gray-700 dark:text-gray-300 line-clamp-2 max-w-xs">{challenge.completion_criteria || "N/A"}</TableCell> {/* Display new field */}
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(challenge)} disabled={loading}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={loading}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-white">Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                            Are you sure you want to delete challenge "{challenge.name}"? This action cannot be undone.
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
    </div>
  );
};

export default AdminCommunityChallengeManagement;