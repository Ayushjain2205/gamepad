"use client";

import { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import SnakeLoading from "@/components/SnakeLoading";
import PongLoading from "@/components/PongLoading";
import RemixBottomSheet from "@/components/RemixBottomSheet";
import Link from "next/link";

interface RemixGame {
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
    isRemix?: boolean;
    createdAt?: string;
  };
}

export default function RemixedPage() {
  const [remixGame, setRemixGame] = useState<RemixGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [showPublishPopup, setShowPublishPopup] = useState(false);
  const [showRemixSheet, setShowRemixSheet] = useState(false);
  const [publishOptions, setPublishOptions] = useState({
    name: "",
    inGameToken: false,
    ads: false,
    paidPlay: false,
  });

  // Call create-remix API when page loads
  useEffect(() => {
    const createRemix = async () => {
      try {
        // Get remix parameters from sessionStorage
        const remixParamsString = sessionStorage.getItem("remixParams");

        if (!remixParamsString) {
          console.log("No remix parameters found");
          setIsLoading(false);
          return;
        }

        const remixParams = JSON.parse(remixParamsString);
        console.log("Creating remix with parameters:", remixParams);

        // Clear the parameters from sessionStorage
        sessionStorage.removeItem("remixParams");

        // Call the create-remix API
        const response = await fetch("/api/create-remix", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(remixParams),
        });

        if (response.ok) {
          const remixGame = await response.json();
          console.log("Remix created successfully:", remixGame);
          setRemixGame(remixGame);
          setIsGameLoading(true);
        } else {
          const error = await response.json();
          console.error("Failed to create remix:", error);
          alert("Failed to create remix. Please try again.");
        }
      } catch (error) {
        console.error("Error creating remix:", error);
        alert("An error occurred while creating the remix. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createRemix();
  }, []);

  // Monitor game loading state
  useEffect(() => {
    if (isGameLoading) {
      const loadingTimeout = setTimeout(() => {
        setIsGameLoading(false);
      }, 1200);

      return () => clearTimeout(loadingTimeout);
    }
  }, [isGameLoading]);

  // Initialize publish options with current game name
  useEffect(() => {
    if (remixGame) {
      setPublishOptions((prev) => ({
        ...prev,
        name: remixGame.name,
      }));
    }
  }, [remixGame]);

  const handlePublishClick = () => {
    setShowPublishPopup(true);
  };

  const handlePublishSubmit = () => {
    // TODO: Implement actual publishing logic
    console.log("Publishing remix game with options:", publishOptions);
    setShowPublishPopup(false);
  };

  const handlePublishCancel = () => {
    setShowPublishPopup(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <PongLoading text="Generating your remix..." />
      </div>
    );
  }

  if (!remixGame) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-text mb-4 font-heading">
            Remix not found
          </h1>
          <p className="text-text-muted font-display mb-6">
            The requested remix could not be found.
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
  const componentMatch = remixGame.code.match(/const\s+(\w+)\s*=\s*\(\)\s*=>/);
  let componentName;

  if (remixGame.id === "endless-racer") {
    componentName = "EndlessRacer";
  } else if (remixGame.id === "flappy-bird") {
    componentName = "FlappyBird";
  } else if (remixGame.id === "snake") {
    componentName = "SnakeGame";
  } else if (remixGame.id === "tap-game") {
    componentName = "TapGame";
  } else if (componentMatch && componentMatch[1]) {
    componentName = componentMatch[1];
  } else {
    componentName = remixGame.name
      .replace(/\s+/g, "")
      .replace(/^[0-9]/, "Game$&");
  }

  const generatedCode = `import React, { useState, useEffect, useRef, useCallback } from 'react';

${remixGame.code}

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
              {remixGame.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text font-heading">
                {remixGame.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Publish Button */}
            <button
              onClick={handlePublishClick}
              className="pixelated-button px-3 py-1 text-sm font-medium transition-colors duration-200 font-heading"
            >
              Publish
            </button>

            {/* Modify Button */}
            <button
              onClick={() => setShowRemixSheet(true)}
              className="pixelated-button px-3 py-1 text-sm font-medium transition-colors duration-200 font-heading"
            >
              Modify
            </button>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Game Loading Overlay */}
        {isGameLoading && (
          <div className="absolute inset-0 bg-bg flex items-center justify-center z-20">
            <SnakeLoading text="Loading remix..." size="medium" />
          </div>
        )}

        <Sandpack
          key={`remix-${remixGame.id}`}
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

      {/* Publish Popup */}
      {showPublishPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-text font-heading mb-4">
              Publish Remix
            </h2>

            {/* Game Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-2 font-display">
                Game Name
              </label>
              <input
                type="text"
                value={publishOptions.name}
                onChange={(e) =>
                  setPublishOptions((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-text placeholder-gray-400 focus:outline-none focus:border-accent font-display"
                placeholder="Enter game name"
              />
            </div>

            {/* Publishing Options */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-text font-display">
                Publishing Options
              </h3>

              {/* In-Game Token */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishOptions.inGameToken}
                  onChange={(e) =>
                    setPublishOptions((prev) => ({
                      ...prev,
                      inGameToken: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent focus:ring-2"
                />
                <span className="text-text text-sm font-display">
                  In-Game Token
                </span>
              </label>

              {/* Ads */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishOptions.ads}
                  onChange={(e) =>
                    setPublishOptions((prev) => ({
                      ...prev,
                      ads: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent focus:ring-2"
                />
                <span className="text-text text-sm font-display">Ads</span>
              </label>

              {/* Paid Play */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishOptions.paidPlay}
                  onChange={(e) =>
                    setPublishOptions((prev) => ({
                      ...prev,
                      paidPlay: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent focus:ring-2"
                />
                <span className="text-text text-sm font-display">
                  Paid Play
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handlePublishCancel}
                className="flex-1 px-4 py-2 bg-gray-700 text-text rounded hover:bg-gray-600 transition-colors font-display"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishSubmit}
                className="flex-1 pixelated-button font-heading font-medium"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remix Bottom Sheet */}
      <RemixBottomSheet
        isVisible={showRemixSheet}
        onClose={() => setShowRemixSheet(false)}
        currentGame={remixGame}
      />
    </div>
  );
}
