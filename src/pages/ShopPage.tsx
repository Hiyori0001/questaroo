"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Gem, Sparkles, Shield, RefreshCw } from "lucide-react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ElementType;
  action: (userId: string, profile: any) => Promise<boolean>; // Action to perform on purchase
  achievementName?: string; // Optional: Name of the achievement granted for this item
}

const ShopPage = () => {
  const { user, loading: loadingAuth } = useAuth();
  const { profile, loadingProfile, deductCurrency, addAchievement, updateAvatar } = useUserProfile();
  const navigate = useNavigate();

  // Redirect to auth page if not logged in and not loading
  React.useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/auth");
      toast.info("Please log in to visit the shop.");
    }
  }, [user, loadingAuth, navigate]);

  const shopItems: ShopItem[] = [
    {
      id: "avatar-randomizer",
      name: "Avatar Randomizer",
      description: "Get a brand new random avatar to refresh your look!",
      price: 50,
      icon: RefreshCw,
      achievementName: "Avatar Randomizer Unlocked", // Define the achievement name
      action: async (userId, currentProfile) => {
        if (!currentProfile) return false;
        await updateAvatar(); // Use the existing updateAvatar function
        await addAchievement({ // Add the achievement upon purchase
          name: "Avatar Randomizer Unlocked",
          iconName: "RefreshCw",
          color: "bg-blue-500",
        });
        return true;
      },
    },
    {
      id: "xp-boost-badge",
      name: "XP Boost Badge",
      description: "A temporary badge that signifies your dedication to gaining XP!",
      price: 150,
      icon: Sparkles,
      achievementName: "XP Boost Enthusiast",
      action: async (userId, currentProfile) => {
        if (!currentProfile) return false;
        await addAchievement({
          name: "XP Boost Enthusiast",
          iconName: "Sparkles",
          color: "bg-yellow-500",
        });
        return true;
      },
    },
    {
      id: "rare-gem-collectible",
      name: "Rare Gem Collectible",
      description: "Add a shimmering rare gem to your achievement collection.",
      price: 250,
      icon: Gem,
      achievementName: "Rare Gem Collector",
      action: async (userId, currentProfile) => {
        if (!currentProfile) return false;
        await addAchievement({
          name: "Rare Gem Collector",
          iconName: "Gem",
          color: "bg-purple-500",
        });
        return true;
      },
    },
    {
      id: "guardian-shield-badge",
      name: "Guardian Shield Badge",
      description: "Show off your protective spirit with this unique badge.",
      price: 300,
      icon: Shield,
      achievementName: "Guardian of Questaroo",
      action: async (userId, currentProfile) => {
        if (!currentProfile) return false;
        await addAchievement({
          name: "Guardian of Questaroo",
          iconName: "Shield",
          color: "bg-blue-500",
        });
        return true;
      },
    },
  ];

  const handlePurchase = async (item: ShopItem) => {
    if (!user || !profile) {
      toast.error("You must be logged in to make a purchase.");
      return;
    }

    // Check if the item is already owned (if it grants an achievement)
    if (item.achievementName && profile.achievements.some(a => a.name === item.achievementName)) {
      toast.info(`You already own "${item.name}".`);
      return;
    }

    if (profile.currency < item.price) {
      toast.error("Not enough coins to purchase this item.");
      return;
    }

    const success = await deductCurrency(item.price);
    if (success) {
      const actionSuccess = await item.action(user.id, profile);
      if (actionSuccess) {
        toast.success(`Successfully purchased "${item.name}"!`);
      } else {
        // If action failed but currency was deducted, consider refunding or logging for admin review
        toast.error(`Failed to apply "${item.name}" effect. Please contact support.`);
        // Potentially re-add currency here if the item effect failed
      }
    }
  };

  if (loadingAuth || loadingProfile || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-4 flex-grow">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading shop...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center mb-8">
        <CardHeader className="flex flex-col items-center">
          <ShoppingCart className="h-16 w-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
            Questaroo Shop
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
            Spend your hard-earned coins on exciting items and customizations!
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" /> Your Coins: {profile.currency}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopItems.map((item) => {
              const Icon = item.icon;
              // Check if the item grants an achievement and if that achievement is present in the profile
              const isOwned = item.achievementName && profile.achievements.some(a => a.name === item.achievementName);
              return (
                <Card key={item.id} className="bg-gray-50 dark:bg-gray-800 p-4 flex flex-col items-center text-center">
                  <Icon className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-3" />
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-heading">{item.name}</CardTitle>
                  <CardDescription className="text-gray-700 dark:text-gray-300 flex-grow mb-3">
                    {item.description}
                  </CardDescription>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{item.price} Coins</span>
                  </div>
                  {isOwned ? (
                    <Badge className="bg-green-500 dark:bg-green-700 text-white">Owned</Badge>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={profile.currency < item.price}
                      className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                    >
                      Buy Now
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopPage;