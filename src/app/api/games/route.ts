import { NextRequest, NextResponse } from "next/server";
import {
  getAllGames,
  getGamesByCategory,
  getGamesByDifficulty,
  searchGames,
} from "./registry";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search");

  let games;

  if (search) {
    games = searchGames(search);
  } else if (category) {
    games = getGamesByCategory(category);
  } else if (difficulty) {
    games = getGamesByDifficulty(difficulty);
  } else {
    games = getAllGames();
  }

  // Return full game data for the feed
  const gameList = games.map((game) => ({
    id: game.id,
    name: game.name,
    code: game.code,
    metadata: game.metadata,
  }));

  return NextResponse.json(gameList);
}
