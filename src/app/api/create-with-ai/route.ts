import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for validating the request body
const createWithAiSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  gameType: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  theme: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Log the incoming request
    console.log("=== CREATE WITH AI REQUEST ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("URL:", request.url);
    console.log("Method:", request.method);
    console.log("Headers:", Object.fromEntries(request.headers.entries()));

    // Parse and validate the request body
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const { prompt, gameType, difficulty, theme } =
      createWithAiSchema.parse(body);

    // Log the parsed data
    console.log("Parsed data:", {
      prompt,
      gameType,
      difficulty,
      theme,
    });

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate a test response
    const testResponse = {
      success: true,
      message: "AI game creation initiated successfully",
      gameId: `ai-game-${Date.now()}`,
      generatedCode: `// AI Generated Game: ${prompt}
// Type: ${gameType || "arcade"}
// Difficulty: ${difficulty || "medium"}
// Theme: ${theme || "default"}

class AIGeneratedGame {
  constructor() {
    this.score = 0;
    this.isRunning = false;
  }
  
  start() {
    this.isRunning = true;
    console.log('AI Generated Game Started!');
  }
  
  update() {
    if (this.isRunning) {
      this.score++;
    }
  }
  
  stop() {
    this.isRunning = false;
    console.log('Game Over! Final Score:', this.score);
  }
}

// Export the game
export default AIGeneratedGame;`,
      metadata: {
        name: `AI Generated: ${prompt.substring(0, 50)}${
          prompt.length > 50 ? "..." : ""
        }`,
        description: `An AI-generated game based on: ${prompt}`,
        category: gameType || "arcade",
        difficulty: difficulty || "medium",
        theme: theme || "default",
        aiGenerated: true,
        createdAt: new Date().toISOString(),
      },
      estimatedTime: "2-3 minutes",
      status: "processing",
    };

    console.log(
      "Sending test response:",
      JSON.stringify(testResponse, null, 2)
    );
    console.log("=== END CREATE WITH AI REQUEST ===");

    return NextResponse.json(testResponse, { status: 200 });
  } catch (error) {
    console.error("=== CREATE WITH AI ERROR ===");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Error:", error);
    console.error("=== END CREATE WITH AI ERROR ===");

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
  console.log("=== CREATE WITH AI GET REQUEST ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("URL:", request.url);
  console.log("=== END CREATE WITH AI GET REQUEST ===");

  return NextResponse.json({
    message: "Create with AI API is running",
    endpoints: {
      POST: "/api/create-with-ai - Create a new AI-generated game",
      GET: "/api/create-with-ai - Get API status",
    },
    exampleRequest: {
      prompt: "Create a space shooter game with power-ups",
      gameType: "arcade",
      difficulty: "medium",
      theme: "space",
    },
  });
}
