"use client";

import { useState, useEffect, useRef } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";

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

export default function TikTokFeed() {
  const [games, setGames] = useState<Game[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchOffset, setTouchOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        if (response.ok) {
          const gamesData = await response.json();
          setGames(gamesData);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Touch handlers for swipe gestures with smooth transitions
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
    setTouchOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioning || !touchStart) return;

    const currentY = e.targetTouches[0].clientY;
    const distance = touchStart - currentY;
    setTouchOffset(distance);
    setTouchEnd(currentY);
  };

  const handleTouchEnd = () => {
    if (isTransitioning || !touchStart || !touchEnd) {
      setTouchOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 80;
    const isDownSwipe = distance < -80;

    if (isUpSwipe && currentIndex < games.length - 1) {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex + 1);
      setTouchOffset(0);

      // Reset transition state after animation
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    } else if (isDownSwipe && currentIndex > 0) {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex - 1);
      setTouchOffset(0);

      // Reset transition state after animation
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    } else {
      // Snap back to current position
      setTouchOffset(0);
    }
  };

  // Keyboard navigation with smooth transitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key === "ArrowUp" && currentIndex > 0) {
        setIsTransitioning(true);
        setCurrentIndex(currentIndex - 1);

        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      } else if (e.key === "ArrowDown" && currentIndex < games.length - 1) {
        setIsTransitioning(true);
        setCurrentIndex(currentIndex + 1);

        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, games.length, isTransitioning]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading games...</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">No games available</h1>
          <p className="text-gray-400">Check back later!</p>
        </div>
      </div>
    );
  }

  const currentGame = games[currentIndex];

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
    <div
      ref={containerRef}
      className="h-screen bg-gray-900 relative overflow-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Game Name Header */}
      <div className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-2 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-md">
              {currentGame.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {currentGame.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Leaderboard Icon */}
            <button className="hover:scale-110 transition-transform text-white">
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

            {/* Remix Button */}
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors duration-200">
              Remix
            </button>
          </div>
        </div>
      </div>
      {/* Game Container with Smooth Transitions */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          transform: `translateY(${touchOffset}px)`,
          transition: isTransitioning
            ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
        }}
      >
        {/* Current Game */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${touchOffset}px)`,
            transition: isTransitioning
              ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          }}
        >
          <Sandpack
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
              showOpenInCodeSandbox: false,
              showReadOnly: false,
              showNewFile: false,
              showFileExplorer: false,
              showRunButton: false,
              showStopButton: false,
              showOpenNewtab: false,
              bundlerURL: undefined,
            }}
            theme="dark"
            customSetup={{
              dependencies: {},
            }}
          />
        </div>

        {/* Next Game Preview (if available) */}
        {currentIndex < games.length - 1 && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateY(calc(100% + ${touchOffset}px))`,
              transition: isTransitioning
                ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
            }}
          >
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-lg font-semibold">
                  {games[currentIndex + 1].name}
                </div>
                <div className="text-sm opacity-70">Next Game</div>
              </div>
            </div>
          </div>
        )}

        {/* Previous Game Preview (if available) */}
        {currentIndex > 0 && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateY(calc(-100% + ${touchOffset}px))`,
              transition: isTransitioning
                ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
            }}
          >
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-lg font-semibold">
                  {games[currentIndex - 1].name}
                </div>
                <div className="text-sm opacity-70">Previous Game</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swipe Section Footer */}
      <div className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4 z-30">
        <div className="flex items-center justify-between">
          {/* Swipe Indicator */}
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-400">Swipe up for next game</div>
            <div className="flex space-x-1">
              {games.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentIndex ? "bg-blue-500" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Play Icon */}
            <button className="hover:scale-110 transition-transform text-white">
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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* Create Icon */}
            <button className="hover:scale-110 transition-transform text-white">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* Profile Icon */}
            <button className="hover:scale-110 transition-transform text-white">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Touch Feedback Overlay */}
      {touchOffset !== 0 && !isTransitioning && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(${
              touchOffset > 0 ? "to bottom" : "to top"
            }, 
              rgba(0,0,0,${Math.min(Math.abs(touchOffset) / 200, 0.3)}) 0%, 
              transparent 50%)`,
          }}
        />
      )}
    </div>
  );
}
