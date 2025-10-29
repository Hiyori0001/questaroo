"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, X, Upload, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/UserProfileContext";

interface ChallengeCompletionSubmitterProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  challengeName: string;
  completionCriteria: string | null;
  onSubmissionSuccess: () => void;
}

const ChallengeCompletionSubmitter: React.FC<ChallengeCompletionSubmitterProps> = ({
  isOpen,
  onClose,
  challengeId,
  challengeName,
  completionCriteria,
  onSubmissionSuccess,
}) => {
  const { submitChallengeCompletion } = useUserProfile();
  const [details, setDetails] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (details.trim() === "" && !selectedFile) {
      toast.error("Please provide completion details or upload an image.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitChallengeCompletion(challengeId, details.trim(), selectedFile);
      toast.success("Challenge completion submitted for review!");
      onSubmissionSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error submitting challenge completion:", error);
      toast.error("Failed to submit completion: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDetails("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-[475px] bg-white dark:bg-gray-800">
        <DialogHeader className="flex flex-col items-center">
          <MessageSquareText className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Submit Completion for "{challengeName}"</DialogTitle>
          <DialogDescription className="text-md text-gray-700 dark:text-gray-300 text-center">
            Tell us how you completed the challenge and provide any evidence.
            <span className="mt-2 font-semibold block">Objective: {completionCriteria || "No specific criteria defined."}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="completion-details"
            placeholder="Describe how you completed the challenge (e.g., 'I visited all 5 landmarks and took photos')."
            className="resize-y min-h-[100px]"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            id="evidence-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="col-span-3"
            disabled={isSubmitting}
          />
          {previewUrl && (
            <div className="mt-4 flex justify-center">
              <img src={previewUrl} alt="Evidence Preview" className="max-w-full h-48 object-contain rounded-md border dark:border-gray-700" />
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={isSubmitting || (details.trim() === "" && !selectedFile)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Submit for Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeCompletionSubmitter;