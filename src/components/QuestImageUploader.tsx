"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext"; // Import useUserProfile

interface QuestImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  questId: string;
  completionImagePrompt: string;
}

const QuestImageUploader: React.FC<QuestImageUploaderProps> = ({ isOpen, onClose, questId, completionImagePrompt }) => {
  const { user } = useAuth();
  const { submitImageForVerification } = useUserProfile(); // Use new function from context
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!user) {
      toast.error("You must be logged in to upload an image.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select an image file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      await submitImageForVerification(questId, selectedFile);
      toast.success("Image uploaded! Awaiting quest creator's review.");
      handleClose();
    } catch (error: any) {
      console.error("Error during image submission:", error);
      toast.error("Failed to submit image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader className="flex flex-col items-center">
          <Camera className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-3" />
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Upload Image for Quest</DialogTitle>
          <DialogDescription className="text-md text-gray-700 dark:text-gray-300 text-center">
            {completionImagePrompt}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="col-span-3"
            disabled={isUploading}
          />
          {previewUrl && (
            <div className="mt-4 flex justify-center">
              <img src={previewUrl} alt="Image Preview" className="max-w-full h-48 object-contain rounded-md border dark:border-gray-700" />
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleUpload}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Image
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestImageUploader;