"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Info } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
          Plot Twist
        </Link>
        <div className="space-x-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;