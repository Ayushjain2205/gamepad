import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storeRemixGame } from "../games/remix/[gameId]/route";
import Together from "together-ai";

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

    // Initialize Together AI
    const together = new Together({
      apiKey: process.env.TOGETHER_API_KEY,
    });

    console.log("Sending request to Together AI for code modification...");

    // Create the prompt for Together AI
    const prompt = `You are a game development expert. Modify the following React game code based on the user's instructions.

Original Game Code:
\`\`\`javascript
${gameCode}
\`\`\`

User's Modification Instructions: ${gameDescription}

IMPORTANT: Return ONLY the complete modified React component code. Do NOT include any explanations, comments, or markdown formatting. Do NOT include any text before or after the code. The response must be a complete, working React component that can be rendered directly. Start your response with the first line of code and end with the last line of code.`;

    // Call Together AI to modify the code
    let modifiedCode = gameCode; // Fallback to original code

    try {
      const response = await together.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "Qwen/Qwen3-235B-A22B-Thinking-2507",
        max_tokens: 4000,
        temperature: 0.7,
      });

      // Extract the modified code from the response
      const aiResponse = response.choices[0]?.message?.content;
      console.log("=== AI RESPONSE ===");
      console.log("Raw AI response:", aiResponse);
      console.log("Response length:", aiResponse?.length);
      console.log("=== END AI RESPONSE ===");

      if (aiResponse && aiResponse.trim()) {
        // Clean the response - remove any markdown formatting and explanatory text
        let cleanedCode = aiResponse
          .replace(/```javascript\n?/g, "")
          .replace(/```jsx\n?/g, "")
          .replace(/```tsx\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        // Remove any explanatory text that might come before the actual code
        // Look for the start of a React component (const, function, export, etc.)
        const codeStartPatterns = [
          /^(.*?)(const\s+\w+\s*=)/s,
          /^(.*?)(function\s+\w+)/s,
          /^(.*?)(export\s+default)/s,
          /^(.*?)(import\s+)/s,
        ];

        for (const pattern of codeStartPatterns) {
          const match = cleanedCode.match(pattern);
          if (match && match[1]) {
            // Remove everything before the actual code
            cleanedCode = cleanedCode.replace(match[1], "");
            break;
          }
        }

        // Remove any trailing explanatory text
        // Look for common patterns that indicate end of code
        const codeEndPatterns = [
          /(\n\n[A-Z].*?$)/s, // Text starting with capital letter after double newline
          /(\n\n[^a-zA-Z0-9\s].*?$)/s, // Text after double newline with special characters
        ];

        for (const pattern of codeEndPatterns) {
          cleanedCode = cleanedCode.replace(pattern, "");
        }

        modifiedCode = cleanedCode.trim();

        console.log("=== CLEANED CODE ===");
        console.log("Cleaned code length:", modifiedCode.length);
        console.log("First 200 chars:", modifiedCode.substring(0, 200));
        console.log(
          "Last 200 chars:",
          modifiedCode.substring(Math.max(0, modifiedCode.length - 200))
        );
        console.log("=== END CLEANED CODE ===");

        console.log("Successfully modified code with Together AI");
      } else {
        console.log("No valid response from Together AI, using original code");
      }
    } catch (aiError) {
      console.error("Error calling Together AI:", aiError);
      console.log("Using original code as fallback");
    }

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
      code: modifiedCode, // Use the AI-modified code
      metadata: {
        difficulty: "Custom",
        description: finalDescription,
        icon: "🎮",
        category: "Remix",
        tags: ["remix", "custom", "user-created", "ai-modified"],
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
