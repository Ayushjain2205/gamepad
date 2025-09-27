import { GameDefinition, GameRegistry } from "./types";
import { flappyBirdGame } from "./games/flappy-bird";
import { tapGame } from "./games/tap-game";
import { snakeGame } from "./games/snake";
import { endlessRacerGame } from "./games/endless-racer";
import { candyCrushGame } from "./games/candy-crush";
import { pixelRunnerGame } from "./games/pixel-runner";
import { memoryMatchGame } from "./games/memory-match";
import { slidingPuzzleGame } from "./games/sliding-puzzle";
import { wordleGame } from "./games/wordle";
import { spaceShooterGame } from "./games/space-shooter";

// Registry of all available games
export const gameRegistry: GameRegistry = {
  [flappyBirdGame.id]: flappyBirdGame,
  [tapGame.id]: tapGame,
  [snakeGame.id]: snakeGame,
  [endlessRacerGame.id]: endlessRacerGame,
  [candyCrushGame.id]: candyCrushGame,
  [pixelRunnerGame.id]: pixelRunnerGame,
  [memoryMatchGame.id]: memoryMatchGame,
  [slidingPuzzleGame.id]: slidingPuzzleGame,
  [wordleGame.id]: wordleGame,
  [spaceShooterGame.id]: spaceShooterGame,
};

// Helper function to get all games
export function getAllGames(): GameDefinition[] {
  return Object.values(gameRegistry);
}

// Helper function to get a specific game by ID
export function getGameById(gameId: string): GameDefinition | undefined {
  return gameRegistry[gameId];
}

// Helper function to get games by category
export function getGamesByCategory(category: string): GameDefinition[] {
  return getAllGames().filter((game) => game.metadata.category === category);
}

// Helper function to get games by difficulty
export function getGamesByDifficulty(difficulty: string): GameDefinition[] {
  return getAllGames().filter(
    (game) => game.metadata.difficulty === difficulty
  );
}

// Helper function to search games
export function searchGames(query: string): GameDefinition[] {
  const lowercaseQuery = query.toLowerCase();
  return getAllGames().filter(
    (game) =>
      game.name.toLowerCase().includes(lowercaseQuery) ||
      game.metadata.description.toLowerCase().includes(lowercaseQuery) ||
      game.metadata.tags?.some((tag) =>
        tag.toLowerCase().includes(lowercaseQuery)
      )
  );
}
