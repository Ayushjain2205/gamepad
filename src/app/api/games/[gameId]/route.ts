import { NextRequest, NextResponse } from "next/server";
import { getGameById } from "../registry";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  // Get game from registry
  const game = getGameById(gameId);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Return the game code and metadata with cache-busting headers
  return NextResponse.json(
    {
      id: game.id,
      name: game.name,
      code: game.code,
      metadata: game.metadata,
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
