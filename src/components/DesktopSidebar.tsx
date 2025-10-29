"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { User, LogIn, LogOut, Share2, Accessibility, Settings, ListTodo, Crown, PlusCircle, Users, SwitchCamera, ShoppingCart } from "lucide-react";
import { useSparkle } from "@/contexts/SparkleContext"; // Import useSparkle

interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const { profile, loadingProfile } = useUserProfile();
  const navigate = useNavigate();
  const { triggerSparkle } = useSparkle(); // Use the sparkle hook

  const handleSparkleClick = (event: React.MouseEvent) => {
    triggerSparkle(event.clientX, event.clientY);
  };

  const handleSignOut = async (event: React.MouseEvent) => {
    handleSparkleClick(event); // Trigger sparkle on click
    await signOut();
    onClose();
    navigate("/");
  };

  const handleSwitchAccount = async (event: React.MouseEvent) => {
    handleSparkleClick(event); // Trigger sparkle on click
    await signOut(); // Log out current user
    onClose();
    navigate("/auth"); // Redirect to login page
  };

  const handleNavigation = (path: string, event: React.MouseEvent) => {
    handleSparkleClick(event); // Trigger sparkle on click
    onClose();
    navigate(path);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[250px] sm:w-[300px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white font-heading">More Options</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 py-4 flex-grow overflow-y-auto"> {/* Added overflow-y-auto here */}
          {/* Profile and Admin links */}
          {user ? (
            <>
              <Button
                variant="ghost"
                className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => handleNavigation("/profile", e)} // Add sparkle trigger
              >
                <span> {/* Wrap children in a single span */}
                  <User className="h-4 w-4 mr-2" /> Profile
                </span>
              </Button>
              {profile?.isAdmin && (
                <Button
                  variant="ghost"
                  className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => handleNavigation("/admin", e)} // Add sparkle trigger
                >
                  <span> {/* Wrap children in a single span */}
                    <Settings className="h-4 w-4 mr-2" /> Admin Dashboard
                  </span>
                </Button>
              )}
            </>
          ) : null}

          {/* Other secondary navigation items */}
          <Button
            variant="ghost"
            className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => handleNavigation("/shop", e)} // Add sparkle trigger
          >
            <span> {/* Wrap children in a single span */}
              <ShoppingCart className="h-4 w-4 mr-2" /> Shop
            </span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => handleNavigation("/social", e)} // Add sparkle trigger
          >
            <span> {/* Wrap children in a single span */}
              <Share2 className="h-4 w-4 mr-2" /> Social
            </span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => handleNavigation("/accessibility", e)} // Add sparkle trigger
          >
            <span> {/* Wrap children in a single span */}
              <Accessibility className="h-4 w-4 mr-2" /> Accessibility
            </span>
          </Button>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-gray-700 dark:text-gray-300">Theme</span>
            <ThemeToggle /> {/* ThemeToggle already handles its children */}
          </div>

          {/* Login/Logout/Switch Account */}
          <div className="mt-auto pt-4 border-t dark:border-gray-700">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="justify-start w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleSwitchAccount} // Already has sparkle
                >
                  <span> {/* Wrap children in a single span */}
                    <SwitchCamera className="h-4 w-4 mr-2" /> Switch Account
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleSignOut} // Already has sparkle
                >
                  <span> {/* Wrap children in a single span */}
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </span>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="justify-start w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => handleNavigation("/auth", e)} // Add sparkle trigger
              >
                <span> {/* Wrap children in a single span */}
                  <LogIn className="h-4 w-4 mr-2" /> Login
                </span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DesktopSidebar;