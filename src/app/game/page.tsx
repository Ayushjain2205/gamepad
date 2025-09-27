"use client";

import { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import SnakeLoading from "@/components/SnakeLoading";
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

export default function GamePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const searchParams = useSearchParams();

  // Fetch all games and find the specific one
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        if (response.ok) {
          const gamesData = await response.json();
          setGames(gamesData);

          // Get the game ID from URL params
          const gameId = searchParams.get("id");
          if (gameId) {
            const game = gamesData.find((g: Game) => g.id === gameId);
            if (game) {
              setCurrentGame(game);
              setIsGameLoading(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [searchParams]);

  // Monitor game loading state
  useEffect(() => {
    if (isGameLoading) {
      const loadingTimeout = setTimeout(() => {
        setIsGameLoading(false);
      }, 1200);

      return () => clearTimeout(loadingTimeout);
    }
  }, [isGameLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <SnakeLoading text="Loading game..." size="large" />
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-text mb-4 font-heading">
            Game not found
          </h1>
          <p className="text-text-muted font-display mb-6">
            The requested game could not be found.
          </p>
          <Link
            href="/"
            className="pixelated-button font-display font-medium py-3 px-6 text-lg transition-colors duration-200"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  // Generate the game code with proper component name
  const componentMatch = currentGame.code.match(
    /const\s+(\w+)\s*=\s*\(\)\s*=>/
  );
  let componentName;

  if (currentGame.id === "endless-racer") {
    componentName = "EndlessRacer";
  } else if (currentGame.id === "flappy-bird") {
    componentName = "FlappyBird";
  } else if (currentGame.id === "snake") {
    componentName = "SnakeGame";
  } else if (currentGame.id === "tap-game") {
    componentName = "TapGame";
  } else if (componentMatch && componentMatch[1]) {
    componentName = componentMatch[1];
  } else {
    componentName = currentGame.name
      .replace(/\s+/g, "")
      .replace(/^[0-9]/, "Game$&");
  }

  const generatedCode = `import React, { useState, useEffect, useRef, useCallback } from 'react';

${currentGame.code}

const App = () => {
  return <${componentName} />;
};

export default App;`;

  return (
    <div className="h-screen bg-bg relative overflow-hidden flex flex-col">
      {/* Game Name Header */}
      <div className="flex-shrink-0 bg-primary/50 backdrop-blur-sm border-b border-primary/30 p-2 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center text-text font-bold text-md">
              {currentGame.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text font-heading">
                {currentGame.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Leaderboard Icon */}
            <button className="hover:scale-110 transition-transform text-text">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>

            {/* Modify Button */}
            <Link
              href={`/remix?gameId=${currentGame.id}`}
              className="pixelated-button px-3 py-1 text-sm font-medium transition-colors duration-200 font-heading"
            >
              Modify
            </Link>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Game Loading Overlay */}
        {isGameLoading && (
          <div className="absolute inset-0 bg-bg flex items-center justify-center z-20">
            <SnakeLoading text="Loading game..." size="medium" />
          </div>
        )}

        <Sandpack
          key={`game-${currentGame.id}`}
          template="react"
          files={{
            "/App.js": {
              code: generatedCode,
            },
            "/index.js": {
              code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Force remove body margin before rendering
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.border = 'none';
document.body.style.background = 'transparent';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
            },
          }}
          options={{
            showNavigator: false,
            showRefreshButton: false,
            showTabs: false,
            showLineNumbers: false,
            showInlineErrors: false,
            wrapContent: true,
            editorHeight: 0,
            autorun: true,
            recompileMode: "delayed",
            recompileDelay: 300,
            showConsole: false,
            showConsoleButton: false,
            layout: "preview",
            showReadOnly: false,
            bundlerURL: undefined,
          }}
          theme="dark"
          customSetup={{
            dependencies: {},
          }}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 bg-primary border-t border-primary/30 p-4 z-30">
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
              <span className="text-[#202040] font-heading text-md font-bold">
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
