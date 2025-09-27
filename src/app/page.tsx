"use client";

import { useState, useEffect, useRef } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import SnakeLoading from "@/components/SnakeLoading";
import Link from "next/link";

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
  const [displayGameIndex, setDisplayGameIndex] = useState(0);
  const [isUIOpacityTransitioning, setIsUIOpacityTransitioning] =
    useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);
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
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentIndex < games.length - 1) {
      setIsTransitioning(true);
      setIsUIOpacityTransitioning(true);

      // Update display with a slight delay to ensure smooth transition
      setTimeout(() => {
        setDisplayGameIndex(currentIndex + 1);
        setCurrentIndex(currentIndex + 1);
        setIsGameLoading(true);
      }, 50);

      setTouchOffset(0);

      // Reset transition state after animation
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setIsUIOpacityTransitioning(false);
      }, 500);
    } else if (isDownSwipe && currentIndex > 0) {
      setIsTransitioning(true);
      setIsUIOpacityTransitioning(true);

      // Update display with a slight delay to ensure smooth transition
      setTimeout(() => {
        setDisplayGameIndex(currentIndex - 1);
        setCurrentIndex(currentIndex - 1);
        setIsGameLoading(true);
      }, 50);

      setTouchOffset(0);

      // Reset transition state after animation
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setIsUIOpacityTransitioning(false);
      }, 500);
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
        setIsUIOpacityTransitioning(true);

        setTimeout(() => {
          setDisplayGameIndex(currentIndex - 1);
          setCurrentIndex(currentIndex - 1);
          setIsGameLoading(true);
        }, 50);

        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setIsUIOpacityTransitioning(false);
        }, 500);
      } else if (e.key === "ArrowDown" && currentIndex < games.length - 1) {
        setIsTransitioning(true);
        setIsUIOpacityTransitioning(true);

        setTimeout(() => {
          setDisplayGameIndex(currentIndex + 1);
          setCurrentIndex(currentIndex + 1);
          setIsGameLoading(true);
        }, 50);

        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setIsUIOpacityTransitioning(false);
        }, 500);
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

  // Monitor game loading state and hide overlay when game is ready
  useEffect(() => {
    if (isGameLoading) {
      // Wait for Sandpack to finish loading the new game
      const loadingTimeout = setTimeout(() => {
        setIsGameLoading(false);
      }, 1200); // Increased timeout to ensure Sandpack finishes

      return () => clearTimeout(loadingTimeout);
    }
  }, [currentIndex, isGameLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <SnakeLoading text="Loading games..." size="large" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-text mb-4 font-heading">
            No games available
          </h1>
          <p className="text-text-muted font-display">Check back later!</p>
        </div>
      </div>
    );
  }

  const currentGame = games[currentIndex];
  const displayGame = games[displayGameIndex];

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
      className="h-screen bg-bg relative overflow-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Game Name Header */}
      <div className="flex-shrink-0 bg-primary/50 backdrop-blur-sm border-b border-primary/30 p-2 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center text-text font-bold text-md transition-all duration-300 ease-out"
              style={{
                opacity: isUIOpacityTransitioning ? 0.3 : 1,
                transform: isTransitioning ? "scale(0.95)" : "scale(1)",
              }}
            >
              {displayGame.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1
                className="text-xl font-bold text-text font-heading transition-all duration-300 ease-out"
                style={{
                  opacity: isUIOpacityTransitioning ? 0.2 : 1,
                  transform: isTransitioning
                    ? "translateX(-10px)"
                    : "translateX(0)",
                }}
              >
                {displayGame.name}
              </h1>
            </div>
          </div>
          <div
            className="flex items-center gap-6 transition-all duration-300 ease-out"
            style={{
              opacity: isUIOpacityTransitioning ? 0.3 : 1,
              transform: isTransitioning ? "translateX(10px)" : "translateX(0)",
            }}
          >
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

            {/* Remix Button */}
            <button className="pixelated-button px-3 py-1 text-sm font-medium transition-colors duration-200 font-heading">
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
            ? "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            : "none",
        }}
      >
        {/* Current Game */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${touchOffset}px)`,
            transition: isTransitioning
              ? "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              : "none",
          }}
        >
          {/* Game Loading Overlay */}
          {isGameLoading && (
            <div className="absolute inset-0 bg-bg flex items-center justify-center z-20">
              <SnakeLoading text="Loading game..." size="medium" />
            </div>
          )}

          <Sandpack
            key={`game-${currentIndex}`}
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
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <div className="text-center text-text">
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-lg font-semibold font-heading">
                  {games[currentIndex + 1].name}
                </div>
                <div className="text-sm opacity-70 font-display">Next Game</div>
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
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <div className="text-center text-text">
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-lg font-semibold font-heading">
                  {games[currentIndex - 1].name}
                </div>
                <div className="text-sm opacity-70 font-display">
                  Previous Game
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swipe Section Footer */}
      <div className="flex-shrink-0 bg-primary border-t border-primary/30 p-4 z-30">
        <div className="flex items-center justify-between px-8">
          {/* Home Icon */}
          <Link
            href="/"
            className="hover:scale-110 transition-transform text-text"
            style={{
              opacity: isUIOpacityTransitioning ? 0.3 : 1,
              transform: isTransitioning ? "translateY(5px)" : "translateY(0)",
            }}
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 16 16">
              <rect x="6" y="2" width="4" height="4" />
              <rect x="2" y="6" width="4" height="4" />
              <rect x="10" y="6" width="4" height="4" />
              <rect x="4" y="10" width="8" height="4" />
            </svg>
          </Link>

          {/* Create Button */}
          <Link
            href="/create"
            className="hover:scale-110 transition-transform"
            style={{
              opacity: isUIOpacityTransitioning ? 0.3 : 1,
              transform: isTransitioning ? "translateY(5px)" : "translateY(0)",
            }}
          >
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
            style={{
              opacity: isUIOpacityTransitioning ? 0.3 : 1,
              transform: isTransitioning ? "translateY(5px)" : "translateY(0)",
            }}
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
