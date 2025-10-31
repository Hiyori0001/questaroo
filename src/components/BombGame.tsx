"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Timer, Bomb, Scissors, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { useSparkle } from "@/contexts/SparkleContext"; // Import useSparkle

interface Wire {
  id: string;
  color: string; // Tailwind color class suffix, e.g., "red-500"
  label: string; // e.g., "Red Wire"
  isCorrect: boolean;
}

const WIRE_COLORS = [
  { label: "Red", class: "bg-red-500 hover:bg-red-600" },
  { label: "Blue", class: "bg-blue-500 hover:bg-blue-600" },
  { label: "Green", class: "bg-green-500 hover:bg-green-600" },
  { label: "Yellow", class: "bg-yellow-500 hover:bg-yellow-600" },
  { label: "Purple", class: "bg-purple-500 hover:bg-purple-600" },
  { label: "Black", class: "bg-gray-800 hover:bg-gray-900" },
];

const HINTS = [
  { hint: "The color of the sky on a clear day.", correctWireLabel: "Blue" },
  { hint: "The color of a ripe strawberry.", correctWireLabel: "Red" },
  { hint: "The color of fresh grass.", correctWireLabel: "Green" },
  { hint: "The color of a sunflower.", correctWireLabel: "Yellow" },
  { hint: "The color of royalty.", correctWireLabel: "Purple" },
  { hint: "The color of night.", correctWireLabel: "Black" },
];

const GAME_DURATION_SECONDS = 5;

interface BombGameProps {
  isOpen: boolean;
  onClose: () => void; // Called when dialog is closed (after game ends)
  onDefuse: () => void;
  onExplode: () => void;
}

const BombGame: React.FC<BombGameProps> = ({ isOpen, onClose, onDefuse, onExplode }) => {
  const [countdown, setCountdown] = useState(GAME_DURATION_SECONDS);
  const [wires, setWires] = useState<Wire[]>([]);
  const [correctWireId, setCorrectWireId] = useState<string | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<'defused' | 'exploded' | null>(null);
  const [canCut, setCanCut] = useState(true); // Prevent cutting after game ends or multiple cuts
  const [isExplodingAnimation, setIsExplodingAnimation] = useState(false); // New state for shake animation
  const [showFlash, setShowFlash] = useState(false); // New state for flash effect

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { triggerSparkle } = useSparkle(); // Use the sparkle hook

  const initializeGame = useCallback(() => {
    setCountdown(GAME_DURATION_SECONDS);
    setOutcome(null);
    setCanCut(true);
    setIsExplodingAnimation(false); // Reset animation state
    setShowFlash(false); // Reset flash state

    const shuffledColors = [...WIRE_COLORS].sort(() => 0.5 - Math.random());
    const selectedColors = shuffledColors.slice(0, 4); // Use 4 random colors for wires

    const correctIndex = Math.floor(Math.random() * selectedColors.length);
    const generatedWires: Wire[] = selectedColors.map((color, index) => ({
      id: `wire-${index}`,
      color: color.class,
      label: color.label,
      isCorrect: index === correctIndex,
    }));

    setWires(generatedWires);
    setCorrectWireId(generatedWires[correctIndex].id);

    const hintForCorrectWire = HINTS.find(h => h.correctWireLabel === generatedWires[correctIndex].label);
    setCurrentHint(hintForCorrectWire ? hintForCorrectWire.hint : "Choose wisely, adventurer!");

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setOutcome('exploded');
          onExplode(); // Trigger parent's explode handler
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onExplode]);

  useEffect(() => {
    if (isOpen) {
      initializeGame();
    } else {
      // Cleanup on close
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setOutcome(null);
      setCanCut(true);
      setIsExplodingAnimation(false);
      setShowFlash(false);
    }
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [isOpen, initializeGame]);

  // Effect for explosion animation and vibration
  useEffect(() => {
    if (outcome === 'exploded') {
      setIsExplodingAnimation(true);
      setShowFlash(true);
      // Trigger vibration if supported
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 500]); // A more intense vibration pattern
      }

      const shakeTimeout = setTimeout(() => {
        setIsExplodingAnimation(false);
      }, 500); // Match shake animation duration

      const flashTimeout = setTimeout(() => {
        setShowFlash(false);
      }, 500); // Match flash animation duration

      return () => {
        clearTimeout(shakeTimeout);
        clearTimeout(flashTimeout);
      };
    } else if (outcome === 'defused') {
      // Trigger global sparkle burst on defuse
      triggerSparkle(undefined, undefined, true); // Global burst, no specific coordinates
    }
  }, [outcome, triggerSparkle]);

  const handleWireCut = (wireId: string) => {
    if (!canCut || outcome !== null) return;

    setCanCut(false); // Prevent further cuts
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    if (wireId === correctWireId) {
      setOutcome('defused');
      onDefuse();
      toast.success("Bomb defused! You saved the day!");
    } else {
      setOutcome('exploded');
      onExplode(); // Trigger parent's explode handler
      toast.error("Wrong wire! BOOM! The bomb exploded.");
    }
  };

  const handleCloseDialog = () => {
    if (outcome !== null) { // Only allow closing after game ends
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className={cn(
        "fixed left-[50%] -translate-x-1/2 top-[5%] translate-y-0 sm:max-w-md bg-white dark:bg-gray-800 text-center p-6 relative overflow-hidden z-50 max-h-[90vh] overflow-y-auto",
        isExplodingAnimation && "animate-bomb-shake"
      )}>
        {showFlash && (
          <div className="absolute inset-0 z-50 animate-flash-red pointer-events-none"></div>
        )}
        <DialogHeader className="flex flex-col items-center">
          {outcome === 'defused' ? (
            <CheckCircle2 className="h-20 w-20 text-green-500 mb-4 animate-pop-in" />
          ) : outcome === 'exploded' ? (
            <Bomb className="h-20 w-20 text-red-500 mb-4 animate-pop-in" />
          ) : (
            <Bomb className="h-20 w-20 text-gray-700 dark:text-gray-300 mb-4 animate-pop-in" />
          )}
          <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
            {outcome === 'defused' ? "DEFUSED!" : outcome === 'exploded' ? "EXPLODED!" : "Defuse the Bomb!"}
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-700 dark:text-gray-300">
            {outcome === 'defused' ? "You cut the correct wire!" : outcome === 'exploded' ? "You failed to defuse the bomb in time or cut the wrong wire!" : "Cut the correct wire before time runs out!"}
          </DialogDescription>
        </DialogHeader>

        {outcome === null && (
          <div className="my-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-red-600 dark:text-red-400">
              <Timer className="h-6 w-6" />
              <span>Time Left: {countdown}s</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-md text-gray-800 dark:text-gray-200">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Hint: {currentHint}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {wires.map((wire) => (
                <Button
                  key={wire.id}
                  className={cn(
                    "h-16 text-lg font-semibold flex items-center justify-center gap-2",
                    wire.color, // Apply dynamic background color
                    !canCut && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleWireCut(wire.id)}
                  disabled={!canCut}
                >
                  <Scissors className="h-5 w-5" /> {wire.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button
            onClick={handleCloseDialog}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {outcome === 'defused' ? "Great Job!" : outcome === 'exploded' ? "Try Again!" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BombGame;