"use client";

import { useState, useEffect, useRef } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import SnakeLoading from "@/components/SnakeLoading";
import WelcomePopup from "@/components/WelcomePopup";
import { PaymentOverlay } from "@/components/PaymentOverlay";
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
    isPaid?: boolean;
    price?: {
      amount: string;
      currency: "USDC";
      chainId?: number;
    };
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [purchasedGames, setPurchasedGames] = useState<string[]>([]);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sample game level leaderboard data
  const leaderboardData = [
    { name: "Alice", points: 1250 },
    { name: "Bob", points: 980 },
    { name: "Charlie", points: 750 },
    { name: "Diana", points: 620 },
  ];

  // Load purchased games from localStorage
  useEffect(() => {
    const savedPurchases = localStorage.getItem("purchasedGames");
    if (savedPurchases) {
      setPurchasedGames(JSON.parse(savedPurchases));
    }
  }, []);

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
        // Show welcome popup after games are loaded
        setShowWelcomePopup(true);
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

  // Handle messages from sandboxed games
  useEffect(() => {
    const handleGameMessage = async (event: MessageEvent) => {
      // Validate message structure
      if (!event.data || typeof event.data !== "object") return;
      if (!event.data.type || !event.data.data) return;

      // Handle game score messages
      if (event.data.type === "GAME_SCORE") {
        console.log("Score received from game:", event.data.data);

        // Only call reward API if score is greater than 0
        if (event.data.data.score > 0) {
          // Call reward API with hardcoded addresses
          try {
            const rewardResponse = await fetch("/api/reward", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: "0xc784ecaf24152c3de97e9a3b86a509801393ae3d",
                player: "0xCafa93E9985793E2475bD58B9215c21Dbd421fD0",
                amount: event.data.data.score.toString(),
              }),
            });

            if (rewardResponse.ok) {
              const result = await rewardResponse.json();
              console.log("Reward transaction successful:", result);
            } else {
              const error = await rewardResponse.json();
              console.error("Reward transaction failed:", error);
            }
          } catch (error) {
            console.error("Error calling reward API:", error);
          }
        } else {
          console.log("Score is 0, skipping reward API call");
        }
      }
    };

    window.addEventListener("message", handleGameMessage);
    return () => window.removeEventListener("message", handleGameMessage);
  }, []);

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

  // Helper functions for payment handling
  const isGamePurchased = (gameId: string) => {
    return purchasedGames.includes(gameId);
  };

  const handlePaymentSuccess = () => {
    const updatedPurchases = [...purchasedGames, currentGame.id];
    setPurchasedGames(updatedPurchases);
    localStorage.setItem("purchasedGames", JSON.stringify(updatedPurchases));
    setShowPaymentOverlay(false);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    // Error handling is already done in PaymentOverlay component
  };

  const shouldShowPaymentOverlay = () => {
    return currentGame?.metadata?.isPaid && !isGamePurchased(currentGame.id);
  };

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
            <button
              onClick={() => setShowLeaderboard(true)}
              className="hover:scale-110 transition-transform text-text"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>

            {/* Remix Button */}
            <Link
              href={`/remix?gameId=${displayGame.id}`}
              className="pixelated-button px-3 py-1 text-sm font-medium transition-colors duration-200 font-heading"
            >
              Remix
            </Link>
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

          {/* Payment Overlay - only shows for paid games that aren't purchased */}
          {shouldShowPaymentOverlay() && (
            <PaymentOverlay
              gameName={currentGame.name}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
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

      {/* Leaderboard Popup */}
      {showLeaderboard && (
        <div
          className="fixed inset-0 bg-[#00000090] flex items-center justify-center z-50"
          onClick={() => setShowLeaderboard(false)}
        >
          <div
            className="max-w-sm w-full mx-4 relative"
            style={{
              background: "#0d1117",
              border: "3px solid #00e5ff",
              boxShadow:
                "0px 0px 20px rgba(0, 229, 255, 0.5), inset 0px 0px 20px rgba(0, 229, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b-2 border-cyan-400">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  🏆 HIGH SCORES
                </h2>
                <p className="font-heading text-sm text-cyan-400">
                  {displayGame?.name || "GAME"}
                </p>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="font-heading text-2xl text-cyan-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Player List */}
            <div className="p-4 space-y-2">
              {leaderboardData.map((player, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border-2"
                  style={{
                    background: index === 0 ? "#1e2a47" : "#0d1117",
                    borderColor: index === 0 ? "#00e5ff" : "#1e2a47",
                    boxShadow:
                      index === 0
                        ? "0px 0px 10px rgba(0, 229, 255, 0.3)"
                        : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-lg">
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                    </span>
                    <span className="font-heading text-lg font-bold text-white">
                      {player.name}
                    </span>
                  </div>
                  <span
                    className="font-display text-lg font-bold"
                    style={{ color: index === 0 ? "#00e5ff" : "#a0f0d0" }}
                  >
                    {player.points.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-cyan-400">
              <p className="font-heading text-sm text-center text-cyan-400">
                BEAT THE HIGH SCORE!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Popup */}
      <WelcomePopup
        isVisible={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
      />
    </div>
  );
}
