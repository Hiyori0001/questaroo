"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Info, Gamepad2, User, Crown, PlusCircle, Users, Share2, CalendarDays, Accessibility, Menu, LogIn, LogOut, ListTodo, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

// Define navigation items as an array of objects
const navItems = [
  { to: "/about", icon: Info, label: "About" },
  { to: "/location-quests", icon: MapPin, label: "Quests" },
  { to: "/quest-log", icon: ListTodo, label: "Quest Log" },
  { to: "/mini-games", icon: Gamepad2, label: "Mini-Games" },
  { to: "/leaderboard", icon: Crown, label: "Leaderboard" },
  { to: "/create-quest", icon: PlusCircle, label: "Create Quest" },
  { to: "/teams", icon: Users, label: "Teams" },
  { to: "/social", icon: Share2, label: "Social" },
  { to: "/events", icon: CalendarDays, label: "Events" },
  { to: "/accessibility", icon: Accessibility, label: "Accessibility" },
];

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loadingProfile } = useUserProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsSheetOpen(false);
    navigate("/");
  };

  const renderNavLinks = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.to}
          asChild
          variant="ghost"
          className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm px-2 py-1 flex-shrink-0" // Added flex-shrink-0
          onClick={() => isMobile && setIsSheetOpen(false)}
        >
          <Link to={item.to}>
            <item.icon className="h-4 w-4 mr-1" /> {item.label}
          </Link>
        </Button>
      ))}
      {user ? (
        <>
          {profile?.isAdmin && (
            <Button
              asChild
              variant="ghost"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm px-2 py-1 flex-shrink-0"
              onClick={() => isMobile && setIsSheetOpen(false)}
            >
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-1" /> Admin
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="ghost"
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm px-2 py-1 flex-shrink-0"
            onClick={() => isMobile && setIsSheetOpen(false)}
          >
            <Link to="/profile">
              <User className="h-4 w-4 mr-1" /> Profile
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm px-2 py-1 flex-shrink-0"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </>
      ) : (
        <Button
          asChild
          variant="ghost"
          className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm px-2 py-1 flex-shrink-0"
          onClick={() => isMobile && setIsSheetOpen(false)}
        >
          <Link to="/auth">
            <LogIn className="h-4 w-4 mr-1" /> Login
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white flex-shrink-0">
          Questaroo
        </Link>

        {isMobile ? (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Navigation</h2>
              <div className="flex flex-col gap-2 flex-grow">
                {renderNavLinks()}
              </div>
              <div className="mt-auto p-4 border-t dark:border-gray-700">
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center justify-end gap-x-2 overflow-x-auto pb-1 -mb-1"> {/* Added overflow-x-auto, pb-1, -mb-1 */}
            {renderNavLinks()}
            <ThemeToggle />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;