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
import { useSparkle } from "@/contexts/SparkleContext"; // Import useSparkle

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
  const { triggerSparkle } = useSparkle(); // Use the sparkle hook

  const handleSparkleClick = (event: React.MouseEvent) => {
    triggerSparkle(event.clientX, event.clientY);
  };

  const handleSignOut = async (event: React.MouseEvent) => {
    handleSparkleClick(event); // Trigger sparkle on click
    await signOut();
    setIsMobileSheetOpen(false);
    setIsDesktopSidebarOpen(false);
    navigate("/");
  };

  const handleSwitchAccount = async (event: React.MouseEvent) => {
    handleSparkleClick(event); // Trigger sparkle on click
    await signOut();
    setIsMobileSheetOpen(false);
    setIsDesktopSidebarOpen(false);
    navigate("/auth");
  };

  // Modified to include sparkle trigger
  const handleNavigation = (path: string, event: React.MouseEvent) => {
    handleSparkleClick(event); // Trigger sparkle on click
    setIsMobileSheetOpen(false);
    setIsDesktopSidebarOpen(false);
    navigate(path);
  };

  // Moved all mobile nav items logic into this function, including ThemeToggle
  const renderMobileSheetLinks = () => (
    <>
      {primaryNavItems.map((item) => (
        <Button
          key={item.to}
          variant="ghost"
          className="justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={(e) => handleNavigation(item.to, e)} // Add sparkle trigger
        >
          <span> {/* Wrap children in a single span */}
            <item.icon className="h-4 w-4 mr-2" /> {item.label}
          </span>
        </Button>
      ))}
      {/* Other secondary navigation items */}
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

      {/* Theme Toggle for mobile */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-gray-700 dark:text-gray-300">Theme</span>
        <ThemeToggle /> {/* ThemeToggle already handles its children */}
      </div>

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
                <Settings className="h-4 w-4 mr-2" /> Admin
              </span>
            </Button>
          )}
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
        // The login button inside the sheet is now redundant with the top-level one, but kept for consistency if user opens sheet
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
    </>
  );

  const renderDesktopPrimaryNavLinks = () => (
    <>
      {primaryNavItems.map((item) => (
        <Button
          key={item.to}
          variant="ghost"
          className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm px-2 py-1 flex-shrink-0"
          onClick={(e) => handleNavigation(item.to, e)} // Add sparkle trigger
        >
          <span> {/* Wrap children in a single span */}
            <item.icon className="h-4 w-4 mr-1" /> {item.label}
          </span>
        </Button>
      ))}
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center gap-x-6">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white flex-shrink-0 font-heading" onClick={handleSparkleClick}> {/* Add sparkle trigger to app icon */}
          Questaroo
        </Link>

        {isMobile ? (
          <div className="flex items-center ml-auto"> {/* Wrapper div for right-aligned items */}
            {!user && (
              <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={(e) => handleNavigation("/auth", e)}> {/* Add sparkle trigger */}
                <span> {/* Wrap children in a single span */}
                  <LogIn className="h-6 w-6" />
                  <span className="sr-only">Login</span>
                </span>
              </Button>
            )}
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                {/* Explicitly pass asChild to Button when it's the child of an asChild component */}
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleSparkleClick} asChild>
                  <span> {/* Wrap children in a single span */}
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </span>
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
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={(e) => handleNavigation("/auth", e)}> {/* Add sparkle trigger */}
                  <span> {/* Wrap children in a single span */}
                    <LogIn className="h-6 w-6" />
                    <span className="sr-only">Login</span>
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                onClick={(e) => { handleSparkleClick(e); setIsDesktopSidebarOpen(true); }} // Add sparkle trigger
                asChild
              >
                <span> {/* Wrap children in a single span */}
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">More options</span>
                </span>
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