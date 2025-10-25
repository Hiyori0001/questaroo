"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Share2, MessageSquareText, Twitter, Facebook, Instagram, Send, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

const SocialPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") {
      toast.error("Message cannot be empty.");
      return;
    }

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "You", // For client-side demo, assume "You" are the sender
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage("");
    toast.success("Message sent!");
  };

  const handleShare = (platform: string) => {
    const shareText = "Just completed an awesome quest on Questaroo! Come join the adventure!";
    const shareUrl = "https://questaroo.app"; // Placeholder for the app's main URL

    let url = "";
    switch (platform) {
      case "Twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "Facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "Instagram":
        // Instagram sharing is more complex and usually requires their API or a mobile app.
        // For a web demo, we'll just show a toast.
        toast.info("Instagram sharing typically requires the mobile app. (Feature under development)");
        return;
      default:
        toast.error("Unknown sharing platform.");
        return;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`Opening ${platform} to share your adventure!`);
    }
  };

  const handleCopyLink = async () => {
    const shareLink = "https://questaroo.app/share/my-adventure-id"; // Placeholder link
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Adventure link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-pink-50 to-red-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
        <CardHeader className="flex flex-col items-center">
          <Share2 className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Connect & Share
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Your hub for social interaction and sharing your Questaroo adventures!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 mt-6">
          {/* In-app Chat */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageSquareText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Team Chat</h3>
            </div>
            <div className="h-48 overflow-y-auto bg-white dark:bg-gray-900 rounded-md p-3 mb-4 border dark:border-gray-700">
              {messages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center mt-16">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="mb-2 text-left">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{msg.sender}: </span>
                    <span className="text-gray-800 dark:text-gray-200">{msg.text}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{msg.timestamp}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Prevent new line
                    handleSendMessage();
                  }
                }}
                className="flex-grow resize-none min-h-[40px] max-h-[100px]"
              />
              <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Social Sharing Section */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Share2 className="h-7 w-7 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Share Your Adventures!</h3>
            </div>
            <p className="text-md text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
              Share your latest quest achievements and game progress with friends on social media.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="icon" onClick={() => handleShare("Twitter")}>
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Share on Twitter</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare("Facebook")}>
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Share on Facebook</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare("Instagram")}>
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Share on Instagram</span>
              </Button>
              <Button onClick={handleCopyLink} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                <LinkIcon className="h-4 w-4 mr-2" /> Copy Link
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            (Stay tuned for exciting updates on social features!)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPage;