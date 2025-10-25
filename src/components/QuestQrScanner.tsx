"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface QuestQrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scannedCode: string) => void;
  expectedQrCode: string;
}

const QuestQrScanner: React.FC<QuestQrScannerProps> = ({ isOpen, onClose, onScanComplete, expectedQrCode }) => {
  const [inputCode, setInputCode] = useState("");

  const handleSubmit = () => {
    if (inputCode.trim() === "") {
      toast.error("Please enter the QR code.");
      return;
    }
    onScanComplete(inputCode.trim());
    setInputCode(""); // Clear input after submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setInputCode(""); // Clear input when dialog closes
      }
    }}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader className="flex flex-col items-center">
          <QrCode className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Scan QR Code</DialogTitle>
          <DialogDescription className="text-md text-gray-700 dark:text-gray-300 text-center">
            Imagine you've found a QR code at the quest location. Enter the code below to proceed!
            (Hint: The code is "{expectedQrCode}")
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="qr-code-input"
            placeholder="Enter QR code here"
            className="col-span-3 text-center text-lg"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestQrScanner;