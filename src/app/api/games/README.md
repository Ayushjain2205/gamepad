# Games API - Code Splitting Architecture

This directory contains a modular, code-split architecture for the games API. Each game is now in its own file, making the codebase more maintainable and scalable.

## Directory Structure

```
app/api/games/
├── types.ts              # TypeScript type definitions
├── registry.ts           # Game registry and helper functions
├── route.ts              # API endpoint for listing games
├── [gameId]/
│   └── route.ts          # API endpoint for individual games
├── games/                # Individual game definitions
│   ├── flappy-bird.ts
│   ├── tap-game.ts
│   └── snake.ts
└── README.md             # This file
```

## Key Features

### 1. **Type Safety**

- All games follow the `GameDefinition` interface
- Consistent metadata structure with `GameMetadata`
- Type-safe registry operations

### 2. **Modular Design**

- Each game is in its own file
- Easy to add new games without touching existing code
- Clear separation of concerns

### 3. **Enhanced Metadata**

- Categories (Arcade, Reaction, Puzzle)
- Difficulty levels (Easy, Medium, Hard)
- Tags for better searchability
- Estimated play time

### 4. **API Endpoints**

#### GET `/api/games`

List all games with optional filtering:

- `?category=Arcade` - Filter by category
- `?difficulty=Easy` - Filter by difficulty
- `?search=bird` - Search games by name, description, or tags

#### GET `/api/games/[gameId]`

Get a specific game by ID with full code and metadata.

### 5. **Helper Functions**

- `getAllGames()` - Get all games
- `getGameById(id)` - Get specific game
- `getGamesByCategory(category)` - Filter by category
- `getGamesByDifficulty(difficulty)` - Filter by difficulty
- `searchGames(query)` - Search games

## Adding New Games

1. Create a new file in `games/` directory
2. Export a `GameDefinition` object
3. Add the game to the registry in `registry.ts`
4. The game will automatically be available via the API

## Benefits

- **Maintainability**: Each game is isolated and easy to modify
- **Scalability**: Adding new games doesn't affect existing ones
- **Performance**: Only load games when needed
- **Developer Experience**: Clear structure and type safety
- **Searchability**: Rich metadata enables better game discovery
