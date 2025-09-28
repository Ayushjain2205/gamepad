import { GameDefinition } from "@/app/api/games/types";
import { getAllGames } from "@/app/api/games/registry";

// Keywords and patterns for each game type
const GAME_PATTERNS = {
  "flappy-bird": {
    keywords: [
      "flappy",
      "bird",
      "fly",
      "jump",
      "obstacle",
      "pipe",
      "tap",
      "click",
      "avoid",
      "gravity",
    ],
    concepts: [
      "endless runner",
      "tap to jump",
      "avoid obstacles",
      "gravity-based",
      "side scroller",
    ],
    description:
      "A simple endless runner where you tap to make a bird jump and avoid obstacles",
  },
  snake: {
    keywords: [
      "snake",
      "grow",
      "food",
      "grid",
      "direction",
      "arrow",
      "keys",
      "eat",
      "longer",
    ],
    concepts: [
      "grid-based movement",
      "growing snake",
      "food collection",
      "directional control",
      "classic arcade",
    ],
    description:
      "A classic grid-based game where you control a snake that grows by eating food",
  },
  "tap-game": {
    keywords: [
      "tap",
      "click",
      "timing",
      "rhythm",
      "beat",
      "music",
      "reaction",
      "speed",
    ],
    concepts: [
      "rhythm game",
      "timing-based",
      "music",
      "reaction time",
      "tap sequences",
    ],
    description:
      "A rhythm-based game focused on tapping in time with music or patterns",
  },
  "endless-racer": {
    keywords: [
      "racer",
      "racing",
      "car",
      "speed",
      "3d",
      "endless",
      "road",
      "obstacle",
      "lane",
    ],
    concepts: [
      "3D racing",
      "endless road",
      "lane changing",
      "obstacle avoidance",
      "speed",
    ],
    description:
      "A 3D endless racing game where you dodge obstacles and change lanes",
  },
  "candy-crush": {
    keywords: [
      "match",
      "three",
      "candy",
      "puzzle",
      "swap",
      "color",
      "row",
      "column",
      "chain",
    ],
    concepts: [
      "match-3 puzzle",
      "color matching",
      "swapping tiles",
      "chain reactions",
      "puzzle solving",
    ],
    description:
      "A match-3 puzzle game where you swap candies to create matches",
  },
  "pixel-runner": {
    keywords: [
      "runner",
      "pixel",
      "platform",
      "jump",
      "coin",
      "collect",
      "side",
      "scroller",
    ],
    concepts: [
      "side-scrolling platformer",
      "jumping",
      "coin collection",
      "pixel art",
      "platforms",
    ],
    description: "A side-scrolling platformer with pixel art graphics",
  },
  "memory-match": {
    keywords: [
      "memory",
      "match",
      "card",
      "flip",
      "pair",
      "remember",
      "concentration",
    ],
    concepts: [
      "memory game",
      "card matching",
      "flipping cards",
      "memory training",
      "pairs",
    ],
    description: "A memory game where you flip cards to find matching pairs",
  },
  "sliding-puzzle": {
    keywords: [
      "slide",
      "puzzle",
      "tile",
      "move",
      "grid",
      "solve",
      "15",
      "number",
    ],
    concepts: [
      "sliding puzzle",
      "tile movement",
      "number puzzle",
      "grid-based",
      "solving",
    ],
    description: "A sliding puzzle game where you arrange tiles in order",
  },
  wordle: {
    keywords: [
      "word",
      "guess",
      "letter",
      "hangman",
      "spelling",
      "vocabulary",
      "dictionary",
    ],
    concepts: [
      "word game",
      "letter guessing",
      "vocabulary",
      "spelling",
      "word puzzle",
    ],
    description: "A word-guessing game where you try to find the correct word",
  },
  "space-shooter": {
    keywords: [
      "space",
      "shooter",
      "shoot",
      "enemy",
      "laser",
      "bullet",
      "spaceship",
      "alien",
    ],
    concepts: [
      "space shooter",
      "shooting enemies",
      "lasers",
      "spaceship",
      "alien invasion",
    ],
    description: "A space shooter game where you fight against alien enemies",
  },
};

// Function to calculate similarity between user prompt and game patterns
function calculateSimilarity(prompt: string, patterns: any): number {
  const lowerPrompt = prompt.toLowerCase();
  let score = 0;

  // Check keyword matches
  for (const keyword of patterns.keywords) {
    if (lowerPrompt.includes(keyword.toLowerCase())) {
      score += 2; // Keywords are worth more
    }
  }

  // Check concept matches
  for (const concept of patterns.concepts) {
    if (lowerPrompt.includes(concept.toLowerCase())) {
      score += 1.5;
    }
  }

  // Check description similarity
  const descriptionWords = patterns.description.toLowerCase().split(" ");
  for (const word of descriptionWords) {
    if (lowerPrompt.includes(word) && word.length > 3) {
      score += 0.5;
    }
  }

  return score;
}

// Function to find the best matching game based on user prompt using Qwen AI
export async function findBestMatchingGame(
  prompt: string
): Promise<{
  game: GameDefinition;
  score: number;
  confidence: "high" | "medium" | "low";
} | null> {
  if (!prompt || prompt.trim().length === 0) {
    return null;
  }

  try {
    console.log("=== AI GAME MATCHING ===");
    console.log("User prompt:", prompt);

    const games = getAllGames();
    const gameDescriptions = games.map((game) => ({
      id: game.id,
      name: game.name,
      description: game.metadata.description,
      category: game.metadata.category || "arcade",
      tags: game.metadata.tags || [],
    }));

    // Create prompt for Qwen to analyze and match
    const qwenPrompt = `You are a game analysis AI. Analyze the user's game request and match it to the most appropriate existing game template.

User Request: "${prompt}"

Available Game Templates:
${gameDescriptions
  .map(
    (game) =>
      `- ${game.id}: ${game.name} - ${game.description} (Category: ${
        game.category
      }, Tags: ${game.tags.join(", ")})`
  )
  .join("\n")}

Please respond with ONLY a JSON object in this exact format:
{
  "bestMatch": "game-id",
  "confidence": "high|medium|low",
  "reasoning": "brief explanation of why this game matches",
  "alternativeMatches": ["game-id-1", "game-id-2"]
}

Be very strict about the JSON format. Do not include any other text.`;

    // For now, simulate Qwen API call
    // In production, you would make an actual API call to Qwen
    console.log("Calling Qwen for game matching...");
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

    // Simulate Qwen response based on prompt analysis
    let qwenResponse;

    // Simple fallback to keyword matching if Qwen is not available
    const fallbackMatch = await findBestMatchingGameFallback(prompt);
    if (fallbackMatch) {
      qwenResponse = {
        bestMatch: fallbackMatch.game.id,
        confidence: fallbackMatch.confidence,
        reasoning: `Matched based on keywords: ${prompt}`,
        alternativeMatches: [],
      };
    } else {
      qwenResponse = {
        bestMatch: null,
        confidence: "low",
        reasoning: "No clear match found",
        alternativeMatches: [],
      };
    }

    console.log("Qwen matching response:", qwenResponse);

    if (!qwenResponse.bestMatch) {
      return null;
    }

    const matchedGame = games.find(
      (game) => game.id === qwenResponse.bestMatch
    );
    if (!matchedGame) {
      console.error("Matched game not found:", qwenResponse.bestMatch);
      return null;
    }

    const result = {
      game: matchedGame,
      score:
        qwenResponse.confidence === "high"
          ? 5
          : qwenResponse.confidence === "medium"
          ? 3
          : 1,
      confidence: qwenResponse.confidence as "high" | "medium" | "low",
    };

    console.log("Final matching result:", result);
    console.log("=== END AI GAME MATCHING ===");

    return result;
  } catch (error) {
    console.error("Error in AI game matching:", error);
    // Fallback to keyword matching
    return await findBestMatchingGameFallback(prompt);
  }
}

// Fallback function using keyword matching
async function findBestMatchingGameFallback(
  prompt: string
): Promise<{
  game: GameDefinition;
  score: number;
  confidence: "high" | "medium" | "low";
} | null> {
  const games = getAllGames();
  let bestMatch = null;
  let bestScore = 0;

  for (const game of games) {
    const patterns = GAME_PATTERNS[game.id as keyof typeof GAME_PATTERNS];
    if (!patterns) continue;

    const score = calculateSimilarity(prompt, patterns);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = game;
    }
  }

  // Determine confidence level
  let confidence: "high" | "medium" | "low" = "low";
  if (bestScore >= 3) {
    confidence = "high";
  } else if (bestScore >= 1.5) {
    confidence = "medium";
  }

  // Only return a match if we have some confidence
  if (bestScore < 1) {
    return null;
  }

  return {
    game: bestMatch!,
    score: bestScore,
    confidence,
  };
}

// Function to get game suggestions based on partial matching
export function getGameSuggestions(
  prompt: string,
  limit: number = 3
): Array<{ game: GameDefinition; score: number; reason: string }> {
  if (!prompt || prompt.trim().length === 0) {
    return [];
  }

  const games = getAllGames();
  const suggestions: Array<{
    game: GameDefinition;
    score: number;
    reason: string;
  }> = [];

  for (const game of games) {
    const patterns = GAME_PATTERNS[game.id as keyof typeof GAME_PATTERNS];
    if (!patterns) continue;

    const score = calculateSimilarity(prompt, patterns);

    if (score > 0) {
      // Find the matching keyword or concept for the reason
      let reason = "Similar gameplay style";
      const lowerPrompt = prompt.toLowerCase();

      for (const keyword of patterns.keywords) {
        if (lowerPrompt.includes(keyword.toLowerCase())) {
          reason = `Contains "${keyword}" concept`;
          break;
        }
      }

      suggestions.push({ game, score, reason });
    }
  }

  // Sort by score and return top matches
  return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
}

// Function to extract game concepts from prompt
export function extractGameConcepts(prompt: string): {
  mechanics: string[];
  themes: string[];
  difficulty: "easy" | "medium" | "hard" | null;
  style: string[];
} {
  const lowerPrompt = prompt.toLowerCase();

  // Common game mechanics
  const mechanics = [];
  if (lowerPrompt.includes("jump") || lowerPrompt.includes("platform"))
    mechanics.push("jumping");
  if (lowerPrompt.includes("shoot") || lowerPrompt.includes("laser"))
    mechanics.push("shooting");
  if (lowerPrompt.includes("match") || lowerPrompt.includes("three"))
    mechanics.push("matching");
  if (lowerPrompt.includes("tap") || lowerPrompt.includes("click"))
    mechanics.push("tapping");
  if (lowerPrompt.includes("race") || lowerPrompt.includes("speed"))
    mechanics.push("racing");
  if (lowerPrompt.includes("puzzle") || lowerPrompt.includes("solve"))
    mechanics.push("puzzle");
  if (lowerPrompt.includes("memory") || lowerPrompt.includes("remember"))
    mechanics.push("memory");

  // Common themes
  const themes = [];
  if (lowerPrompt.includes("space") || lowerPrompt.includes("alien"))
    themes.push("space");
  if (lowerPrompt.includes("car") || lowerPrompt.includes("road"))
    themes.push("racing");
  if (lowerPrompt.includes("bird") || lowerPrompt.includes("fly"))
    themes.push("nature");
  if (lowerPrompt.includes("candy") || lowerPrompt.includes("sweet"))
    themes.push("candy");
  if (lowerPrompt.includes("pixel") || lowerPrompt.includes("retro"))
    themes.push("pixel art");

  // Difficulty indicators
  let difficulty: "easy" | "medium" | "hard" | null = null;
  if (lowerPrompt.includes("easy") || lowerPrompt.includes("simple"))
    difficulty = "easy";
  if (
    lowerPrompt.includes("hard") ||
    lowerPrompt.includes("difficult") ||
    lowerPrompt.includes("challenging")
  )
    difficulty = "hard";
  if (lowerPrompt.includes("medium") || lowerPrompt.includes("normal"))
    difficulty = "medium";

  // Style indicators
  const style = [];
  if (lowerPrompt.includes("3d") || lowerPrompt.includes("three dimension"))
    style.push("3D");
  if (lowerPrompt.includes("2d") || lowerPrompt.includes("two dimension"))
    style.push("2D");
  if (lowerPrompt.includes("pixel") || lowerPrompt.includes("retro"))
    style.push("pixel art");
  if (lowerPrompt.includes("smooth") || lowerPrompt.includes("modern"))
    style.push("modern");

  return {
    mechanics,
    themes,
    difficulty,
    style,
  };
}
