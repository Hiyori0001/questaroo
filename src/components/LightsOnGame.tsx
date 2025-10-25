"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, LightbulbOff, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const GRID_SIZE = 5; // 5x5 grid

const LightsOnGame: React.FC = () => {
  const [board, setBoard] = useState<boolean[][]>([]); // true for on, false for off
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Helper to toggle lights on a given board (used for both game logic and board generation)
  const toggleLights = (row: number, col: number, currentBoard: boolean[][]) => {
    const newBoard = currentBoard.map(arr => [...arr]); // Deep copy

    const toggleCell = (r: number, c: number) => {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        newBoard[r][c] = !newBoard[r][c];
      }
    };

    toggleCell(row, col); // Toggle clicked light
    toggleCell(row - 1, col); // Up
    toggleCell(row + 1, col); // Down
    toggleCell(row, col - 1); // Left
    toggleCell(row, col + 1); // Right

    return newBoard;
  };

  // Function to create a random solvable board
  const createSolvableBoard = useCallback(() => {
    let currentBoard: boolean[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));

    // Apply random clicks to ensure solvability
    // Each "click" toggles the cell and its neighbors, creating a random pattern
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (Math.random() < 0.25) { // Reduced probability to 25% for fewer initial lights
          currentBoard = toggleLights(i, j, currentBoard); // Correctly update the board
        }
      }
    }
    return currentBoard;
  }, []);

  const initializeGame = useCallback(() => {
    setBoard(createSolvableBoard());
    setMoves(0);
    setGameOver(false);
    toast.info("Lights On game started! Turn all lights on.");
  }, [createSolvableBoard]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleLightClick = (row: number, col: number) => {
    if (gameOver) return;

    const newBoard = toggleLights(row, col, board);
    setBoard(newBoard);
    setMoves((prevMoves) => prevMoves + 1);

    // Check for win condition: all lights are ON
    const allLightsOn = newBoard.every((r) => r.every((light) => light));
    if (allLightsOn) {
      setGameOver(true);
      toast.success(`Congratulations! You turned on all lights in ${moves + 1} moves!`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-lg p-6 text-center">
      <CardHeader>
        <Lightbulb className="h-16 w-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lights On!
        </CardTitle>
        <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
          Turn on all the lights on the grid. Clicking a light toggles it and its neighbors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
          <p>Moves: {moves}</p>
          {gameOver && (
            <p className="text-green-600 dark:text-green-400">All Lights On!</p>
          )}
        </div>

        <div
          className="grid gap-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: `${GRID_SIZE * 50 + (GRID_SIZE - 1) * 8}px`, // Adjust width based on GRID_SIZE and gap
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((lightOn, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                variant="outline"
                size="icon"
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-md transition-colors duration-100",
                  lightOn
                    ? "bg-yellow-300 hover:bg-yellow-400 border-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:border-yellow-700"
                    : "bg-gray-200 hover:bg-gray-300 border-gray-400 dark:bg-gray-800 dark:hover:bg-gray-600 dark:border-gray-700",
                  gameOver && "cursor-not-allowed opacity-80"
                )}
                onClick={() => handleLightClick(rowIndex, colIndex)}
                disabled={gameOver}
              >
                {lightOn ? (
                  <Lightbulb className="h-6 w-6 text-yellow-800 dark:text-yellow-200" />
                ) : (
                  <LightbulbOff className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </Button>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center mt-6">
        <Button onClick={initializeGame} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          <RefreshCw className="h-4 w-4 mr-2" /> Play Again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LightsOnGame;