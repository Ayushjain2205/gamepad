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
              className="w-full bg-accent hover:bg-accent/80 disabled:bg-accent/50 text-bg font-medium py-3 px-6 rounded-lg transition-colors duration-200 font-display"
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
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </a>

          {/* Create Icon */}
          <a
            href="/create"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg
              className="w-7 h-7"
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
          </a>

          {/* Wallet Icon */}
          <a
            href="/wallet"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
