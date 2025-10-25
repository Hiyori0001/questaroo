"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Info, Gamepad2, User, Crown, PlusCircle, Users, Share2, CalendarDays, Accessibility, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Import Sheet components
import { useIsMobile } from "@/hooks/use-mobile"; // Import the useIsMobile hook

const Navbar = () => {
  const isMobile = useIsMobile();

  const navLinks = (
    <>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/about">
          <Info className="h-4 w-4 mr-2" /> About
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/location-quests">
          <MapPin className="h-4 w-4 mr-2" /> Quests
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/mini-games">
          <Gamepad2 className="h-4 w-4 mr-2" /> Mini-Games
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/profile">
          <User className="h-4 w-4 mr-2" /> Profile
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/leaderboard">
          <Crown className="h-4 w-4 mr-2" /> Leaderboard
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/create-quest">
          <PlusCircle className="h-4 w-4 mr-2" /> Create Quest
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/teams">
          <Users className="h-4 w-4 mr-2" /> Teams
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/social">
          <Share2 className="h-4 w-4 mr-2" /> Social
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/events">
          <CalendarDays className="h-4 w-4 mr-2" /> Events
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link to="/accessibility">
          <Accessibility className="h-4 w-4 mr-2" /> Accessibility
        </Link>
      </Button>
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
          Questaroo
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px] flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Navigation</h2>
                <div className="flex flex-col gap-2">
                  {navLinks}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            {navLinks}
            <ThemeToggle />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;