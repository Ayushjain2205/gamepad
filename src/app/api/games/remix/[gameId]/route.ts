import { NextRequest, NextResponse } from "next/server";

// In-memory storage for remix games (in production, this would be a database)
const remixGames = new Map<string, any>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  // Log the incoming request
  console.log("=== REMIX GAME REQUEST ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("URL:", request.url);
  console.log("Method:", request.method);
  console.log("Game ID:", gameId);

  // Check if it's a remix game ID
  if (!gameId.startsWith("remix-")) {
    console.log("Not a remix game ID:", gameId);
    console.log("=== END REMIX GAME REQUEST (404) ===");
    return NextResponse.json({ error: "Not a remix game" }, { status: 404 });
  }

  // Get game from remix storage
  const game = remixGames.get(gameId);

  if (!game) {
    console.log("Remix game not found for ID:", gameId);
    console.log("=== END REMIX GAME REQUEST (404) ===");
    return NextResponse.json(
      { error: "Remix game not found" },
      { status: 404 }
    );
  }

  // Log the game data
  console.log("Found remix game:", {
    id: game.id,
    name: game.name,
    codeLength: game.code.length,
    metadata: game.metadata,
  });

  console.log("=== END REMIX GAME REQUEST ===");

  // Return the game code and metadata with cache-busting headers
  return NextResponse.json(game, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// Helper function to store a remix game (called by create-remix)
export function storeRemixGame(game: any) {
  remixGames.set(game.id, game);
  console.log("Stored remix game:", game.id);
}

// Helper function to get all remix games (for debugging)
export function getAllRemixGames() {
  return Array.from(remixGames.values());
}
