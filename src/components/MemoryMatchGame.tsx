"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Brain, Gem, Star, Heart, Flower, Cloud, Sun, Moon, Zap, Shield, Anchor, Bell, Briefcase, Camera, Car, Coffee, Crown, Diamond, Feather, Gift, Globe, Key, Leaf, Lightbulb, Lock, MessageSquare, Mountain, Music, PawPrint, Plane, Rocket, Scissors, Smile, Snowflake, Target, TreePine, Umbrella, Volume2, Watch, Wifi, ZapOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Define a set of icons for the game
const gameIcons = [
  Gem, Star, Heart, Flower, Cloud, Sun, Moon, Zap, Shield, Anchor, Bell, Briefcase, Camera, Car, Coffee, Crown, Diamond, Feather, Gift, Globe, Key, Leaf, Lightbulb, Lock, MessageSquare, Mountain, Music, PawPrint, Plane, Rocket, Scissors, Smile, Snowflake, Target, TreePine, Umbrella, Volume2, Watch, Wifi, ZapOff
];

interface CardData {
  id: number;
  icon: React.ElementType;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatchGame = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]); // Stores indices of currently flipped cards
  const [matchesFound, setMatchesFound] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [canFlip, setCanFlip] = useState(true); // To prevent rapid flipping

  const initializeGame = useCallback(() => {
    const numPairs = 8; // Number of unique pairs
    const selectedIcons = gameIcons.sort(() => 0.5 - Math.random()).slice(0, numPairs);
    const initialCards: CardData[] = [];

    selectedIcons.forEach((Icon, index) => {
      initialCards.push({ id: index * 2, icon: Icon, isFlipped: false, isMatched: false });
      initialCards.push({ id: index * 2 + 1, icon: Icon, isFlipped: false, isMatched: false });
    });

    // Shuffle the cards
    const shuffledCards = initialCards.sort(() => 0.5 - Math.random());

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchesFound(0);
    setAttempts(0);
    setGameOver(false);
    setCanFlip(true);
    // Removed: toast.info("Memory Match game started! Find all the pairs.");
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (matchesFound === cards.length / 2 && cards.length > 0) {
      setGameOver(true);
      toast.success(`Congratulations! You found all pairs in ${attempts} attempts!`);
    }
  }, [matchesFound, cards.length, attempts]);

  const handleCardClick = (index: number) => {
    if (!canFlip || cards[index].isFlipped || cards[index].isMatched || gameOver) {
      return;
    }

    setCards((prevCards) =>
      prevCards.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards((prevFlipped) => [...prevFlipped, index]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setCanFlip(false); // Disable flipping while checking
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.icon === secondCard.icon) {
        // Match found
        setMatchesFound((prev) => prev + 1);
        setCards((prevCards) =>
          prevCards.map((card, i) =>
            i === firstIndex || i === secondIndex ? { ...card, isMatched: true } : card
          )
        );
        setFlippedCards([]);
        setCanFlip(true); // Re-enable flipping
        toast.success("Match found!");
      } else {
        // No match, flip back after a delay
        setAttempts((prev) => prev + 1);
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card, i) =>
              i === firstIndex || i === secondIndex ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
          setCanFlip(true); // Re-enable flipping
          toast.warning("No match. Try again!");
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  return (
    <Card className="w-full max-w-xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
      <CardHeader>
        <Brain className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
          Memory Match
        </CardTitle>
        <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
          Flip cards and find matching pairs!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
          <p>Attempts: {attempts}</p>
          <p>Matches: {matchesFound} / {cards.length / 2}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, index) => (
            <Button
              key={card.id}
              variant="outline"
              className={cn(
                "relative w-full h-20 sm:h-24 flex items-center justify-center text-3xl font-bold rounded-lg transition-all duration-200",
                "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600",
                (card.isFlipped || card.isMatched) && "bg-blue-100 dark:bg-blue-900",
                card.isMatched && "border-2 border-green-500 dark:border-green-400",
                !canFlip && !card.isFlipped && !card.isMatched && "cursor-not-allowed opacity-70"
              )}
              onClick={() => handleCardClick(index)}
              disabled={!canFlip || card.isFlipped || card.isMatched || gameOver}
            >
              {(card.isFlipped || card.isMatched) ? (
                <card.icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-xl">?</span>
              )}
            </Button>
          ))}
        </div>

        {gameOver && (
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            You completed the game in {attempts} attempts!
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center mt-6">
        <Button onClick={initializeGame} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          <RefreshCw className="h-4 w-4 mr-2" /> Play Again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MemoryMatchGame;