"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Info, Gamepad2, Crown, PlusCircle, Users, CalendarDays, Menu, ListTodo, User, LogIn, LogOut, Share2, Accessibility, Settings, SwitchCamera, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import DesktopSidebar from "./DesktopSidebar";
import { ThemeToggle } from "./ThemeToggle";

const primaryNavItems = [
  { to: "/about", icon: Info, label: "About" },
  { to: "/location-quests", icon: MapPin, label: "Quests" },
  { to: "/quest-log", icon: ListTodo, label: "Quest Log" },
  { to: "/mini-games", icon: Gamepad2, label: "Mini-Games" },
  { to: "/leaderboard", icon: Crown, label: "Leaderboard" },
  { to: "/create-quest", icon: PlusCircle, label: "Create Quest" },
  { to: "/teams", icon: Users, label: "Teams" },
  { to: "/events", icon: CalendarDays, label: "Events" },
  { to: "/shop", icon: ShoppingCart, label: "Shop" },
];

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loadingProfile } = useUserProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsMobileSheetOpen(false);
    setIsDesktopSidebarOpen(false);
    navigate("/");
  };

  const handleSwitchAccount = async () => {
    await signOut();
    setIsMobileSheetOpen(false);
    setIsDesktopSidebarOpen(false);
    navigate("/auth");
  };

  // Moved all mobile nav items logic into this function, including ThemeToggle
  const renderMobileSheetLinks = () => (
    <>
      {primaryNavItems.map((item) => (
        <Button
          key={item.to}
          asChild
          variant="ghost"
          className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setIsMobileSheetOpen(false)}
        >
          <Link to={item.to}>
            <item.icon className="h-4 w-4 mr-2" /> {item.label}
          </Link>
        </Button>
      ))}
      {/* Other secondary navigation items */}
      <Button
        asChild
        variant="ghost"
        className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsMobileSheetOpen(false)}
      >
        <Link to="/social">
          <Share2 className="h-4 w-4 mr-2" /> Social
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsMobileSheetOpen(false)}
      >
        <Link to="/accessibility">
          <Accessibility className="h-4 w-4 mr-2" /> Accessibility
        </Link>
      </Button>

      {/* Theme Toggle for mobile */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-gray-700 dark:text-gray-300">Theme</span>
        <ThemeToggle />
      </div>

      {/* Profile and Admin links */}
      {user ? (
        <>
          <Button
            asChild
            variant="ghost"
            className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsMobileSheetOpen(false)}
          >
            <Link to="/profile">
              <User className="h-4 w-4 mr-2" /> Profile
            </Link>
          </Button>
          {profile?.isAdmin && (
            <Button
              asChild
              variant="ghost"
              className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMobileSheetOpen(false)}
            >
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" /> Admin
              </Link>
            </Button>
          )}
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
        // The login button inside the sheet is now redundant with the top-level one, but kept for consistency if user opens sheet
        <Button
          asChild
          variant="ghost"
          className="justify-start w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setIsMobileSheetOpen(false)}
        >
          <Link to="/auth">
            <LogIn className="h-4 w-4 mr-2" /> Login
          </Link>
        </Button>
      )}
    </>
  );

  const renderDesktopPrimaryNavLinks = () => (
    <>
      {primaryNavItems.map((item) => (
        <Button
          key={item.to}
          asChild
          variant="ghost"
          className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm px-2 py-1 flex-shrink-0"
        >
          <Link to={item.to}>
            <item.icon className="h-4 w-4 mr-1" /> {item.label}
          </Link>
        </Button>
      ))}
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center gap-x-6">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white flex-shrink-0 font-heading">
          Questaroo
        </Link>

        {isMobile ? (
          <div className="flex items-center ml-auto"> {/* Wrapper div for right-aligned items */}
            {!user && (
              <Button asChild variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link to="/auth">
                  <LogIn className="h-6 w-6" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px] flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Navigation</h2>
                <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
                  {renderMobileSheetLinks()}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center justify-start gap-x-2 flex-wrap flex-grow">
            {renderDesktopPrimaryNavLinks()}
            <div className="flex items-center gap-x-2 ml-auto"> {/* Wrapper div for right-aligned items */}
              {!user && (
                <Button asChild variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link to="/auth">
                    <LogIn className="h-6 w-6" />
                    <span className="sr-only">Login</span>
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                onClick={() => setIsDesktopSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">More options</span>
              </Button>
            </div>
            <DesktopSidebar isOpen={isDesktopSidebarOpen} onClose={() => setIsDesktopSidebarOpen(false)} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;