import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  findBestMatchingGame,
  extractGameConcepts,
} from "@/lib/game-prompt-matcher";

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

    // Parse and validate the request body
    const body = await request.json();
    const { prompt, gameType, difficulty, theme } =
      createWithAiSchema.parse(body);

    console.log("User prompt:", prompt);

    // Step 1: Find the best matching game based on user prompt using Qwen
    const matchingResult = await findBestMatchingGame(prompt);
    console.log("Matching result:", matchingResult);

    // Step 2: Extract game concepts from the prompt
    const concepts = extractGameConcepts(prompt);
    console.log("Extracted concepts:", concepts);

    // Step 3: Generate AI code using Qwen
    let generatedCode: string;
    let gameMetadata: any;

    if (matchingResult && matchingResult.confidence === "high") {
      // Use the matched game as a strong base
      generatedCode = await generateGameCodeWithQwen(
        prompt,
        matchingResult.game,
        concepts
      );
      gameMetadata = {
        name: `${matchingResult.game.name} Variant`,
        description: `A customized version of ${matchingResult.game.name} based on your request: ${prompt}`,
        category: gameType || "custom",
        difficulty: difficulty || concepts.difficulty || "medium",
        theme: theme || concepts.themes[0] || "custom",
        aiGenerated: true,
        baseGame: matchingResult.game.id,
        confidence: matchingResult.confidence,
        createdAt: new Date().toISOString(),
      };
    } else if (matchingResult) {
      // Use the matched game as inspiration
      generatedCode = await generateGameCodeWithQwen(
        prompt,
        matchingResult.game,
        concepts,
        true
      );
      gameMetadata = {
        name: `${prompt.substring(0, 30)}...`,
        description: `A custom game inspired by ${matchingResult.game.name}: ${prompt}`,
        category: gameType || "custom",
        difficulty: difficulty || concepts.difficulty || "medium",
        theme: theme || concepts.themes[0] || "custom",
        aiGenerated: true,
        inspiration: matchingResult.game.id,
        confidence: matchingResult.confidence,
        createdAt: new Date().toISOString(),
      };
    } else {
      // Generate from scratch
      generatedCode = await generateGameCodeFromScratch(prompt, concepts);
      gameMetadata = {
        name: `${prompt.substring(0, 30)}...`,
        description: `A custom game created from your request: ${prompt}`,
        category: gameType || "custom",
        difficulty: difficulty || concepts.difficulty || "medium",
        theme: theme || concepts.themes[0] || "custom",
        aiGenerated: true,
        confidence: "low",
        createdAt: new Date().toISOString(),
      };
    }

    const gameId = `ai-game-${Date.now()}`;

    // Validate generated code
    console.log("=== CODE VALIDATION ===");
    console.log("Generated code length:", generatedCode.length);
    console.log(
      "Generated code preview:",
      generatedCode.substring(0, 300) + "..."
    );

    // Check for common issues
    const hasJsonInCode =
      generatedCode.includes('"mechanics":') ||
      generatedCode.includes('"themes":');
    if (hasJsonInCode) {
      console.error(
        "WARNING: Generated code contains JSON - this will cause syntax errors!"
      );
    }

    const hasValidReact =
      generatedCode.includes("const ") && generatedCode.includes("useState");
    if (!hasValidReact) {
      console.error("WARNING: Generated code may not be valid React!");
    }

    console.log("Code validation complete");

    const response = {
      success: true,
      message: "AI game creation completed successfully",
      gameId,
      generatedCode,
      metadata: gameMetadata,
      matching: matchingResult,
      concepts,
      estimatedTime: "1-2 minutes",
      status: "completed",
      debug: {
        codeLength: generatedCode.length,
        hasJsonInCode,
        hasValidReact,
        matchingConfidence: matchingResult?.confidence,
        conceptsExtracted: concepts,
      },
    };

    console.log("=== END CREATE WITH AI REQUEST ===");
    console.log("Response summary:", {
      gameId,
      codeLength: generatedCode.length,
      matchingConfidence: matchingResult?.confidence,
      conceptsCount: Object.keys(concepts).length,
    });

    return NextResponse.json(response, { status: 200 });
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

// AI Code Generation Functions
async function generateGameCodeWithQwen(
  prompt: string,
  baseGame: any,
  concepts: any,
  isInspiration: boolean = false
): Promise<string> {
  try {
    console.log("=== AI CODE GENERATION WITH QWEN ===");
    console.log("Base game:", baseGame.id, baseGame.name);
    console.log("User prompt:", prompt);
    console.log("Concepts:", concepts);
    console.log("Is inspiration:", isInspiration);

    // For now, we'll simulate the Qwen API call
    // In production, you would make an actual API call to Qwen
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time

    // Create Qwen prompt for code generation
    const qwenPrompt = `You are an expert React game developer. Generate a React component for a game based on the user's request.

User Request: "${prompt}"
Base Game Template: ${baseGame.name} (${baseGame.id})
Game Concepts: Mechanics: ${concepts.mechanics.join(
      ", "
    )}, Themes: ${concepts.themes.join(", ")}

IMPORTANT RULES:
1. Output ONLY valid React/JavaScript code
2. Do NOT include any JSON, comments about JSON, or metadata in the code
3. Use the base game code as a starting point but modify it according to the user's request
4. The component should be a functional React component using hooks
5. Include proper game mechanics, state management, and user interactions
6. Make sure the code is syntactically correct and can run immediately

Base Game Code:
\`\`\`
${baseGame.code}
\`\`\`

Generate the modified game code now:`;

    console.log("Qwen prompt for code generation:", qwenPrompt);

    // Simulate Qwen response - in production this would be an actual API call
    console.log("Calling Qwen for code generation...");

    // Create a modified version of the base game based on user prompt
    let modifiedCode = baseGame.code;

    // Extract the main component name from the base game
    const componentMatch = baseGame.code.match(/const\s+(\w+)\s*=\s*\(\)\s*=>/);
    const originalComponentName = componentMatch
      ? componentMatch[1]
      : "BaseGame";
    const newComponentName = `${originalComponentName}Custom`;

    // Apply modifications based on user prompt and concepts
    console.log("Applying modifications based on prompt:", prompt);
    console.log("Concepts to apply:", concepts);

    // Modify the component name
    modifiedCode = modifiedCode.replace(
      new RegExp(`const\\s+${originalComponentName}\\s*=\\s*\\(\\)\\s*=>`),
      `const ${newComponentName} = () =>`
    );

    // Apply concept-based modifications
    if (
      concepts.mechanics.includes("shooting") &&
      baseGame.id !== "space-shooter"
    ) {
      console.log("Adding shooting mechanics...");

      // Find where to insert shooting mechanics (after existing state)
      const stateInsertionPoint = modifiedCode.indexOf(
        "const [gameStarted, setGameStarted]"
      );
      if (stateInsertionPoint !== -1) {
        const shootingCode = `
  // Shooting mechanics added based on user request
  const [bullets, setBullets] = useState([]);
  const [canShoot, setCanShoot] = useState(true);
  
  const shoot = useCallback(() => {
    if (canShoot && gameStarted && !gameOver) {
      setCanShoot(false);
      setTimeout(() => setCanShoot(true), 200);
      
      setBullets(prev => [...prev, {
        x: gameStateRef.current.bird.x + 20,
        y: gameStateRef.current.bird.y + 10,
        velocity: -8
      }]);
    }
  }, [canShoot, gameStarted, gameOver]);`;

        modifiedCode =
          modifiedCode.slice(0, stateInsertionPoint) +
          shootingCode +
          "\n  " +
          modifiedCode.slice(stateInsertionPoint);
      }
    }

    if (concepts.mechanics.includes("tapping")) {
      console.log("Enhancing tap mechanics...");

      // Modify tap sensitivity or add tap feedback
      modifiedCode = modifiedCode.replace(
        /const\s+jump\s*=\s*useCallback\(\(\)\s*=>\s*{/,
        `const jump = useCallback(() => {
    // Enhanced tap mechanics for better responsiveness
    console.log('Tap detected!');`
      );
    }

    if (concepts.themes.includes("space")) {
      console.log("Applying space theme...");

      // Change colors to space theme
      modifiedCode = modifiedCode.replace(
        /fillStyle\s*=\s*["'][^"']*["']/g,
        'fillStyle = "#00ffff"'
      );
      modifiedCode = modifiedCode.replace(
        /backgroundColor.*?;/g,
        'backgroundColor: "#000011";'
      );
      modifiedCode = modifiedCode.replace(/bg-\w+-\d+/g, "bg-gray-900");
    }

    // Add custom modifications based on specific prompt keywords
    if (prompt.toLowerCase().includes("moving ball")) {
      console.log("Adding moving ball mechanics...");

      // Add ball movement logic
      const ballCode = `
  // Moving ball mechanics
  const [ball, setBall] = useState({ x: 100, y: 100, velocityX: 2, velocityY: 2 });
  
  const updateBall = useCallback(() => {
    if (!gameStarted || gameOver) return;
    
    setBall(prev => ({
      x: prev.x + prev.velocityX,
      y: prev.y + prev.velocityY,
      velocityX: prev.x <= 0 || prev.x >= 300 ? -prev.velocityX : prev.velocityX,
      velocityY: prev.y <= 0 || prev.y >= 400 ? -prev.velocityY : prev.velocityY
    }));
  }, [gameStarted, gameOver]);`;

      // Insert ball code after existing state
      const stateEnd = modifiedCode.indexOf("const jump = useCallback");
      if (stateEnd !== -1) {
        modifiedCode =
          modifiedCode.slice(0, stateEnd) +
          ballCode +
          "\n  " +
          modifiedCode.slice(stateEnd);
      }
    }

    // Modify game title and description
    if (prompt.length > 0) {
      const gameTitle = prompt
        .split(" ")
        .slice(0, 4)
        .join(" ")
        .replace(/[^a-zA-Z0-9\s]/g, "");
      if (gameTitle) {
        modifiedCode = modifiedCode.replace(
          /<h2[^>]*>.*?<\/h2>/g,
          `<h2 className="text-2xl font-bold mb-4">${gameTitle}</h2>`
        );
      }
    }

    // Add generation header as comments only
    const aiHeader = `// Custom Game - Based on ${
      isInspiration ? "inspiration from" : "variation of"
    } ${baseGame.name}
// User Request: ${prompt}
// Generated on: ${new Date().toISOString()}

`;

    // Update the export statement to use the new component name
    modifiedCode = modifiedCode.replace(
      new RegExp(`export default ${originalComponentName};`),
      `export default ${newComponentName};`
    );

    const finalCode = aiHeader + modifiedCode;

    console.log("Generated code length:", finalCode.length);
    console.log("Generated code preview:", finalCode.substring(0, 200) + "...");
    console.log(
      "Component name changed from:",
      originalComponentName,
      "to:",
      newComponentName
    );
    console.log("=== END AI CODE GENERATION ===");

    return finalCode;
  } catch (error) {
    console.error("Error generating code with Qwen:", error);
    throw new Error("Failed to generate game code with AI");
  }
}

async function generateGameCodeFromScratch(
  prompt: string,
  concepts: any
): Promise<string> {
  try {
    console.log("=== AI CODE GENERATION FROM SCRATCH ===");
    console.log("User prompt:", prompt);
    console.log("Concepts:", concepts);

    // Simulate Qwen API call for from-scratch generation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Generate a basic game template based on concepts
    const gameName =
      prompt
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
        .replace(/[^a-zA-Z0-9]/g, "") || "CustomGame";

    console.log("Generated game name:", gameName);

    let gameCode = `// Custom Game - Created from scratch
// User Request: ${prompt}
// Generated on: ${new Date().toISOString()}

const ${gameName} = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  
  // Game state
  const gameStateRef = useRef({
    player: { x: 100, y: 100, velocity: 0 },
    enemies: [],
    items: [],
    animationId: null
  });
  
  // Game constants
  const GAME_SPEED = 1;
  const PLAYER_SIZE = 20;
  
  // Game mechanics based on concepts
  ${
    concepts.mechanics.includes("jumping")
      ? `
  const [jumpVelocity, setJumpVelocity] = useState(0);
  const GRAVITY = 0.5;
  const JUMP_FORCE = -8;`
      : ""
  }
  
  ${
    concepts.mechanics.includes("shooting")
      ? `
  const [bullets, setBullets] = useState([]);
  const [canShoot, setCanShoot] = useState(true);`
      : ""
  }
  
  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    
    // Initialize game state
    gameStateRef.current = {
      player: { x: 100, y: 100, velocity: 0 },
      enemies: [],
      items: [],
      animationId: null
    };
  }, []);
  
  // Game loop
  const gameLoop = useCallback((ctx) => {
    if (!gameStarted || gameOver) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw player
    ctx.fillStyle = "${
      concepts.themes.includes("space") ? "#00ffff" : "#ff6b6b"
    }";
    ctx.fillRect(
      gameStateRef.current.player.x, 
      gameStateRef.current.player.y, 
      PLAYER_SIZE, 
      PLAYER_SIZE
    );
    
    // Update game logic
    ${
      concepts.mechanics.includes("jumping")
        ? `
    // Apply gravity
    gameStateRef.current.player.velocity += GRAVITY;
    gameStateRef.current.player.y += gameStateRef.current.player.velocity;
    
    // Ground collision
    if (gameStateRef.current.player.y > ctx.canvas.height - PLAYER_SIZE) {
      gameStateRef.current.player.y = ctx.canvas.height - PLAYER_SIZE;
      gameStateRef.current.player.velocity = 0;
    }`
        : ""
    }
    
    // Continue animation
    gameStateRef.current.animationId = requestAnimationFrame(() => gameLoop(ctx));
  }, [gameStarted, gameOver]);
  
  // Handle user input
  const handleKeyPress = useCallback((e) => {
    if (!gameStarted) {
      startGame();
      return;
    }
    
    if (gameOver) {
      startGame();
      return;
    }
    
    ${
      concepts.mechanics.includes("jumping")
        ? `
    if (e.code === 'Space') {
      e.preventDefault();
      gameStateRef.current.player.velocity = JUMP_FORCE;
    }`
        : ""
    }
    
    ${
      concepts.mechanics.includes("shooting")
        ? `
    if (e.code === 'ArrowUp' && canShoot) {
      setCanShoot(false);
      setTimeout(() => setCanShoot(true), 200);
      
      setBullets(prev => [...prev, {
        x: gameStateRef.current.player.x + PLAYER_SIZE / 2,
        y: gameStateRef.current.player.y,
        velocity: -5
      }]);
    }`
        : ""
    }
  }, [gameStarted, gameOver, startGame]);
  
  // Effects
  useEffect(() => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Start game loop
    if (gameStarted && !gameOver) {
      gameLoop(ctx);
    }
    
    return () => {
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
  
  return (
    <div className="w-full h-full bg-${
      concepts.themes.includes("space") ? "gray-900" : "blue-100"
    } relative overflow-hidden">
      <canvas
        id="game-canvas"
        className="w-full h-full"
        style={{ background: '${
          concepts.themes.includes("space")
            ? "linear-gradient(to bottom, #000011, #000033)"
            : "linear-gradient(to bottom, #87CEEB, #98FB98)"
        }' }}
      />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white font-bold">
        Score: {score}
      </div>
      
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">${gameName}</h2>
            <p className="mb-4">${prompt}</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="mb-4">Final Score: {score}</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-bold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${gameName};`;

    console.log("Generated from-scratch code length:", gameCode.length);
    console.log(
      "Generated from-scratch code preview:",
      gameCode.substring(0, 200) + "..."
    );
    console.log("=== END AI CODE GENERATION FROM SCRATCH ===");

    return gameCode;
  } catch (error) {
    console.error("Error generating code from scratch:", error);
    throw new Error("Failed to generate game code from scratch");
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
