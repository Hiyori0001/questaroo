"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquareText } from "lucide-react"; // Removed Robot, kept MessageSquareText
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const BOT_RESPONSES: { [key: string]: string } = {
  "hello": "Hello there, adventurer! How can I assist you today?",
  "hi": "Greetings, fellow explorer! What's on your mind?",
  "how are you": "I'm a bot, so I don't have feelings, but I'm ready to help you! How can I be of service?",
  "games": "Questaroo offers exciting mini-games like Trivia, Guess the Number, Clicker Challenge, Memory Match, Reaction Time, and Lights On! You can find them under the 'Mini-Games' section.",
  "quests": "Embark on thrilling location-based quests! Visit the 'Quests' page to discover adventures near you or create your own. Some quests require you to be at a specific location, scan a QR code, or upload an image!",
  "how to play": "To play, simply navigate to 'Quests' or 'Mini-Games'. For quests, follow the instructions to complete tasks in the real world. For mini-games, each has its own rules, but they're all designed for fun and challenge!",
  "help": "I'm here to help! What specifically do you need assistance with? Try asking about 'games', 'quests', or 'how to play'.",
  "team": "You can join or create teams on the 'Teams' page! Collaborate with friends, earn team XP, and climb the leaderboards together.",
  "social": "Connect with friends, send requests, and chat with your team on the 'Social' page. You can also share your achievements!",
  "shop": "Visit the 'Shop' to spend your hard-earned coins on exciting items and customizations for your profile!",
  "admin": "The Admin Dashboard is for administrators only. It allows them to manage users, quests, teams, and community challenges.",
  "events": "Check out the 'Events' page for limited-time community challenges and seasonal events with exclusive rewards!",
  "profile": "Your 'Profile' page displays your level, experience, currency, achievements, and team status. You can also edit your profile details and avatar there.",
  "accessibility": "The 'Accessibility' page allows you to customize your experience with options like high contrast mode and larger text. We aim to make Questaroo enjoyable for everyone!",
  "bye": "Goodbye, adventurer! May your quests be epic and your rewards plentiful!",
  "thank you": "You're most welcome! Happy adventuring!",
};

const ROBOT_STATUSES = [
  { emoji: "🤖", text: "Idle" },
  { emoji: "😴", text: "Sleeping" },
  { emoji: "🎮", text: "Playing" },
  { emoji: "🏁", text: "Racing" },
  { emoji: "💡", text: "Thinking" },
  { emoji: "✨", text: "Helping" },
];

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [robotStatus, setRobotStatus] = useState(ROBOT_STATUSES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRobotStatus(prevStatus => {
        const currentIndex = ROBOT_STATUSES.indexOf(prevStatus);
        const nextIndex = (currentIndex + 1) % ROBOT_STATUSES.length;
        return ROBOT_STATUSES[nextIndex];
      });
    }, 5000); // Change status every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim() === "") return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const lowerCaseMessage = newUserMessage.text.toLowerCase();
      let botResponseText = "I'm still learning, but I'll do my best to help! Try asking about 'games', 'quests', or 'how to play'.";

      for (const keyword in BOT_RESPONSES) {
        if (lowerCaseMessage.includes(keyword)) {
          botResponseText = BOT_RESPONSES[keyword];
          break;
        }
      }

      const newBotMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newBotMessage]);
    }, 1000);
  }, [inputMessage]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 z-40 animate-pop-in"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-4xl">{robotStatus.emoji}</span>
        <span className="sr-only">Open Chatbot</span>
        <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          {robotStatus.text}
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col bg-white dark:bg-gray-800">
          <DialogHeader className="flex flex-col items-center">
            <MessageSquareText className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-2" /> {/* Changed to MessageSquareText */}
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
              Questaroo AI Chatbot
            </DialogTitle>
            <DialogDescription className="text-md text-gray-700 dark:text-gray-300 text-center">
              Ask me anything about Questaroo!
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-grow p-4 border rounded-md bg-gray-50 dark:bg-gray-900 my-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 italic">
                  Type a message to start chatting!
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.sender === "bot" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                        🤖
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] p-3 rounded-lg shadow-sm",
                      msg.sender === "user"
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="block text-xs opacity-75 mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                  {msg.sender === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        👤
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow"
            />
            <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send Message</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chatbot;