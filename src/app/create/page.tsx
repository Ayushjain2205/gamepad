"use client";

import { useState } from "react";

export default function CreatePage() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = () => {
    setIsCreating(true);
    // TODO: Implement game creation logic
    setTimeout(() => setIsCreating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="flex-shrink-0 bg-primary/50 backdrop-blur-sm border-b border-primary/30 p-4">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold text-text font-heading">
            Create Game
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pb-20">
        <div className="max-w-md mx-auto">
          {/* Create Game Card */}
          <div className="bg-primary/30 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-bg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text font-heading mb-2">
                Build Your Game
              </h2>
              <p className="text-text-muted font-display text-sm">
                Create and customize your own interactive game
              </p>
            </div>

            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full pixelated-button font-medium py-3 px-6 transition-colors duration-200 font-display disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Start Creating"}
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-4">
            <div className="bg-primary/20 rounded-lg p-4">
              <h3 className="text-text font-heading font-semibold mb-2">
                🎮 Game Types
              </h3>
              <p className="text-text-muted font-display text-sm">
                Choose from various game templates and customize them
              </p>
            </div>

            <div className="bg-primary/20 rounded-lg p-4">
              <h3 className="text-text font-heading font-semibold mb-2">
                🎨 Customization
              </h3>
              <p className="text-text-muted font-display text-sm">
                Personalize colors, sounds, and game mechanics
              </p>
            </div>

            <div className="bg-primary/20 rounded-lg p-4">
              <h3 className="text-text font-heading font-semibold mb-2">
                🚀 Publishing
              </h3>
              <p className="text-text-muted font-display text-sm">
                Share your creation with the community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex-shrink-0 bg-primary border-t border-primary/30 p-4 z-30">
        <div className="flex items-center justify-between px-8">
          {/* Home Icon */}
          <a
            href="/"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 16 16">
              <rect x="6" y="2" width="4" height="4" />
              <rect x="2" y="6" width="4" height="4" />
              <rect x="10" y="6" width="4" height="4" />
              <rect x="4" y="10" width="8" height="4" />
            </svg>
          </a>

          {/* Create Button */}
          <a href="/create" className="hover:scale-110 transition-transform">
            <div className="pixelated-button px-3 py-1">
              <span className="text-[#202040] font-heading text-sm font-bold">
                Create
              </span>
            </div>
          </a>

          {/* Wallet Icon */}
          <a
            href="/wallet"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 16 16">
              <rect x="2" y="6" width="12" height="2" />
              <rect x="3" y="8" width="10" height="6" />
              <rect x="5" y="10" width="2" height="2" />
              <rect x="9" y="10" width="2" height="2" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
