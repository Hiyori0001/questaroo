"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { User, LogIn, LogOut, Share2, Accessibility, Settings, ListTodo, Crown, PlusCircle, Users, SwitchCamera, ShoppingCart } from "lucide-react"; // Import ShoppingCart

interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const { profile, loadingProfile } = useUserProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

  const handleSwitchAccount = async () => {
    await signOut(); // Log out current user
    onClose();
    navigate("/auth"); // Redirect to login page
  };

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[250px] sm:w-[300px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white">More Options</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 py-4 flex-grow overflow-y-auto"> {/* Added overflow-y-auto here */}
          {/* Profile and Admin links */}
          {user ? (
            <>
              <Button
                variant="ghost"
                className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleNavigation("/profile")}
              >
                <User className="h-4 w-4 mr-2" /> Profile
              </Button>
              {profile?.isAdmin && (
                <Button
                  variant="ghost"
                  className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleNavigation("/admin")}
                >
                  <Settings className="h-4 w-4 mr-2" /> Admin Dashboard
                </Button>
              )}
            </>
          ) : null}

          {/* Other secondary navigation items */}
          <Button
            variant="ghost"
            className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleNavigation("/shop")}
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Shop
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleNavigation("/social")}
          >
            <Share2 className="h-4 w-4 mr-2" /> Social
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleNavigation("/accessibility")}
          >
            <Accessibility className="h-4 w-4 mr-2" /> Accessibility
          </Button>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-gray-700 dark:text-gray-300">Theme</span>
            <ThemeToggle />
          </div>

          {/* Login/Logout/Switch Account */}
          <div className="mt-auto pt-4 border-t dark:border-gray-700">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="justify-start w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleSwitchAccount}
                >
                  <SwitchCamera className="h-4 w-4 mr-2" /> Switch Account
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="justify-start w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleNavigation("/auth")}
              >
                <LogIn className="h-4 w-4 mr-2" /> Login
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DesktopSidebar;