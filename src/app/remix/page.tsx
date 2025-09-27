"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Game {
  id: string;
  name: string;
  code: string;
  metadata: {
    difficulty: string;
    description: string;
    icon: string;
    category?: string;
    tags?: string[];
    estimatedPlayTime?: string;
  };
}

export default function RemixPage() {
  const [gameDescription, setGameDescription] = useState("");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");

  // Fetch the current game being remixed
  useEffect(() => {
    const fetchCurrentGame = async () => {
      if (gameId) {
        try {
          const response = await fetch(`/api/games/${gameId}`);
          if (response.ok) {
            const gameData = await response.json();
            setCurrentGame(gameData);
          }
        } catch (error) {
          console.error("Error fetching game:", error);
        }
      }
    };

    fetchCurrentGame();
  }, [gameId]);

  const handleGenerateGame = () => {
    if (gameDescription.trim() && currentGame) {
      console.log(
        "Remixing game:",
        currentGame.name,
        "with description:",
        gameDescription
      );
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm border-b border-primary/30">
        <h1 className="text-2xl font-bold text-text font-heading">
          Remix {currentGame?.name || "Game"}
        </h1>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {/* Game Description Input */}
        <div className="mb-8">
          <div className="relative bg-gray-800 rounded-lg p-4 min-h-[120px]">
            <textarea
              value={gameDescription}
              onChange={(e) => setGameDescription(e.target.value)}
              placeholder="Describe your remix idea or modifications..."
              className="w-full h-full bg-transparent text-text placeholder-text-muted resize-none outline-none text-sm font-display"
              rows={4}
            />

            {/* Bottom controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-start">
              {/* Image icon */}
              <button className="text-text hover:text-text-muted transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Maybe try this section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text font-heading mb-4">
            Maybe try this
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setGameDescription("Remove intro delay")}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <span className="text-2xl">✨</span>
              <span className="text-text font-display">Remove intro delay</span>
            </button>

            <button
              onClick={() => setGameDescription("Auto-restart on game over")}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <span className="text-2xl">🎯</span>
              <span className="text-text font-display">
                Auto-restart on game over
              </span>
            </button>

            <button
              onClick={() => setGameDescription("Epic on-click explosion")}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <span className="text-2xl">💥</span>
              <span className="text-text font-display">
                Epic on-click explosion
              </span>
            </button>

            <button
              onClick={() => setGameDescription("Sparkle trail for diamond")}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <span className="text-2xl">🪄</span>
              <span className="text-text font-display">
                Sparkle trail for diamond
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Generate Game Button - Fixed above bottom nav */}
      {gameDescription.trim() && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-20">
          <button
            onClick={handleGenerateGame}
            className="w-full pixelated-button font-display font-medium py-4 px-6 text-lg transition-colors duration-200"
          >
            Remix Game
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex-shrink-0 bg-primary border-t border-primary/30 p-4 z-30">
        <div className="flex items-center justify-between px-8">
          {/* Home Icon */}
          <Link
            href="/"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 16 16">
              <rect x="6" y="2" width="4" height="4" />
              <rect x="2" y="6" width="4" height="4" />
              <rect x="10" y="6" width="4" height="4" />
              <rect x="4" y="10" width="8" height="4" />
            </svg>
          </Link>

          {/* Create Button */}
          <Link href="/create" className="hover:scale-110 transition-transform">
            <div className="pixelated-button px-3 py-1">
              <span className="text-[#202040] font-heading text-sm font-bold">
                Create
              </span>
            </div>
          </Link>

          {/* Wallet Icon */}
          <Link
            href="/wallet"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 16 16">
              <rect x="2" y="6" width="12" height="2" />
              <rect x="3" y="8" width="10" height="6" />
              <rect x="5" y="10" width="2" height="2" />
              <rect x="9" y="10" width="2" height="2" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
