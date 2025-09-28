"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface RemixBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  currentGame: Game | null;
}

export default function RemixBottomSheet({
  isVisible,
  onClose,
  currentGame,
}: RemixBottomSheetProps) {
  const [gameDescription, setGameDescription] = useState("");
  const [isRemixing, setIsRemixing] = useState(false);
  const router = useRouter();

  const handleGenerateGame = async () => {
    if (gameDescription.trim() && currentGame) {
      setIsRemixing(true);

      try {
        console.log(
          "Remixing game:",
          currentGame.name,
          "with description:",
          gameDescription
        );

        // Store the remix parameters in sessionStorage for the remixed page
        const remixParams = {
          gameCode: currentGame.code,
          gameName: `${currentGame.name} Remix`,
          gameDescription: gameDescription,
        };

        sessionStorage.setItem("remixParams", JSON.stringify(remixParams));

        // Close the bottom sheet
        onClose();

        // Redirect to the remixed page - it will call the API and show PongLoading
        router.push("/remixed");
      } catch (error) {
        console.error("Error preparing remix:", error);
        alert("An error occurred while preparing the remix. Please try again.");
        setIsRemixing(false);
      }
    }
  };

  // Reset form when bottom sheet opens
  useEffect(() => {
    if (isVisible) {
      setGameDescription("");
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-bg rounded-t-3xl shadow-2xl border-t border-primary/30 max-h-[90vh] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-text/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-primary/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text font-heading">
              Remix {currentGame?.name || "Game"}
            </h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Game Description Input */}
          <div>
            <label className="block text-sm font-medium text-text mb-2 font-display">
              Describe your remix idea
            </label>
            <div className="relative bg-gray-800 rounded-lg p-4 min-h-[120px]">
              <textarea
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                placeholder="Describe your remix idea or modifications..."
                className="w-full h-full bg-transparent text-white placeholder-white resize-none outline-none text-sm font-display"
                rows={4}
              />
            </div>
          </div>

          {/* Quick Suggestions */}
          <div>
            <h3 className="text-lg font-bold text-text font-heading mb-3">
              Quick Ideas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGameDescription("Remove intro delay")}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex items-center gap-2 transition-colors text-left"
              >
                <span className="text-xl">✨</span>
                <span className="text-text font-display text-sm">
                  Remove intro delay
                </span>
              </button>

              <button
                onClick={() => setGameDescription("Auto-restart on game over")}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex items-center gap-2 transition-colors text-left"
              >
                <span className="text-xl">🎯</span>
                <span className="text-text font-display text-sm">
                  Auto-restart on game over
                </span>
              </button>

              <button
                onClick={() => setGameDescription("Epic on-click explosion")}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex items-center gap-2 transition-colors text-left"
              >
                <span className="text-xl">💥</span>
                <span className="text-text font-display text-sm">
                  Epic on-click explosion
                </span>
              </button>

              <button
                onClick={() => setGameDescription("Sparkle trail for diamond")}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex items-center gap-2 transition-colors text-left"
              >
                <span className="text-xl">🪄</span>
                <span className="text-text font-display text-sm">
                  Sparkle trail for diamond
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-primary/30">
          <button
            onClick={handleGenerateGame}
            disabled={!gameDescription.trim() || isRemixing}
            className={`w-full pixelated-button font-display font-medium py-4 px-6 text-lg transition-colors duration-200 ${
              !gameDescription.trim() || isRemixing
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isRemixing ? "Creating Remix..." : "Remix Game"}
          </button>
        </div>
      </div>
    </div>
  );
}
