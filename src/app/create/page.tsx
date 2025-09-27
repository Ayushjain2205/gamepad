"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreatePage() {
  const [gameDescription, setGameDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const gameTemplates = [
    {
      id: "3d-racer",
      name: "3D Racer",
    },
    {
      id: "2d-platformer",
      name: "2D Platformer",
    },
    {
      id: "puzzle",
      name: "Puzzle Game",
    },
    {
      id: "strategy",
      name: "Strategy",
    },
    {
      id: "endless-racer",
      name: "Endless Racer",
    },
    {
      id: "candy-crush",
      name: "Candy Crush",
    },
    {
      id: "pixel-runner",
      name: "Pixel Runner",
    },
    {
      id: "memory-match",
      name: "Memory Match",
    },
    {
      id: "sliding-puzzle",
      name: "Sliding Puzzle",
    },
    {
      id: "wordle",
      name: "Wordle",
    },
    {
      id: "space-shooter",
      name: "Space Shooter",
    },
  ];

  // const handleCreateFromDescription = () => {
  //   // TODO: Implement game creation from description
  //   console.log("Creating game from description:", gameDescription);
  // };

  const handleCreateFromTemplate = (templateId: string) => {
    // Toggle selection - if already selected, deselect it
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null);
      console.log("Deselected template:", templateId);
    } else {
      setSelectedTemplate(templateId);
      console.log("Selected template:", templateId);
    }
  };

  const handleGenerateGame = () => {
    if (gameDescription.trim()) {
      console.log("Generating game from description:", gameDescription);
    } else if (selectedTemplate) {
      console.log("Generating game from template:", selectedTemplate);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm border-b border-primary/30">
        <h1 className="text-2xl font-bold text-text font-heading">
          Create Game
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
              placeholder="Describe your game idea..."
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

        {/* Template Section */}
        <div className="pb-32">
          <h2 className="text-xl font-bold text-text font-heading mb-4">
            Or Start From a Template
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {gameTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleCreateFromTemplate(template.id)}
                className={`rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? "bg-accent/20 border-2 border-accent"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div className="text-center">
                  <button
                    className={`w-full text-sm font-display font-medium py-3 px-4 rounded transition-colors ${
                      selectedTemplate === template.id
                        ? "bg-accent text-bg hover:bg-accent/80"
                        : "bg-gray-600 hover:bg-gray-500 text-text"
                    }`}
                  >
                    {template.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Game Button - Fixed above bottom nav */}
      {(gameDescription.trim() || selectedTemplate) && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-20">
          <button
            onClick={handleGenerateGame}
            className="w-full pixelated-button font-display font-medium py-4 px-6 text-lg transition-colors duration-200"
          >
            Generate Game
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
