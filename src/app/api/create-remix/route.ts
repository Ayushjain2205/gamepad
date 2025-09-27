import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storeRemixGame } from "../games/remix/[gameId]/route";

// Schema for validating the request body
const createRemixSchema = z.object({
  gameCode: z.string().min(1, "Game code is required"),
  gameName: z.string().optional(),
  gameDescription: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Log the incoming request
    console.log("=== CREATE REMIX REQUEST ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("URL:", request.url);
    console.log("Method:", request.method);
    console.log("Headers:", Object.fromEntries(request.headers.entries()));

    // Parse and validate the request body
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const { gameCode, gameName, gameDescription } =
      createRemixSchema.parse(body);

    // Log the parsed data
    console.log("Parsed data:", {
      gameCodeLength: gameCode.length,
      gameName,
      gameDescription,
    });

    // Generate a unique game ID for the remix
    const gameId = `remix-${Date.now()}`;
    const finalGameName =
      gameName || `Remix Game ${new Date().toLocaleDateString()}`;
    const finalDescription =
      gameDescription || "A remixed game created by the user";

    // Create the game object in the same format as the registry
    const remixGame = {
      id: gameId,
      name: finalGameName,
      code: gameCode,
      metadata: {
        difficulty: "Custom",
        description: finalDescription,
        icon: "🎮",
        category: "Remix",
        tags: ["remix", "custom", "user-created"],
        estimatedPlayTime: "5-10 minutes",
        isRemix: true,
        createdAt: new Date().toISOString(),
      },
    };

    console.log("Created remix game:", {
      id: remixGame.id,
      name: remixGame.name,
      codeLength: remixGame.code.length,
      metadata: remixGame.metadata,
    });

    // Store the remix game in the remix storage
    storeRemixGame(remixGame);

    console.log("=== END CREATE REMIX REQUEST ===");

    // Return the game in the same format as the individual game API
    return NextResponse.json(remixGame, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("=== CREATE REMIX ERROR ===");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Error:", error);
    console.error("=== END CREATE REMIX ERROR ===");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests for testing
export async function GET(request: NextRequest) {
  console.log("=== CREATE REMIX GET REQUEST ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("URL:", request.url);
  console.log("=== END CREATE REMIX GET REQUEST ===");

  return NextResponse.json({
    message: "Create Remix API is running",
    endpoints: {
      POST: "/api/create-remix - Create a remix game from code",
      GET: "/api/create-remix - Get API status",
    },
    exampleRequest: {
      gameCode: "const MyGame = () => { return <div>Hello World</div>; };",
      gameName: "My Custom Game",
      gameDescription: "A simple custom game",
    },
  });
}
