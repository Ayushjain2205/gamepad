// In-memory storage for remix games (in production, this would be a database)
const remixGames = new Map<
  string,
  {
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
>();

// Helper function to store a remix game (called by create-remix)
export function storeRemixGame(game: {
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
}) {
  remixGames.set(game.id, game);
  console.log("Stored remix game:", game.id);
}

// Helper function to get a remix game by ID
export function getRemixGame(gameId: string) {
  return remixGames.get(gameId);
}

// Helper function to get all remix games (for debugging)
export function getAllRemixGames() {
  return Array.from(remixGames.values());
}
