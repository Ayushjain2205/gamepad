export interface GameMetadata {
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  icon: string;
  category?: string;
  tags?: string[];
  estimatedPlayTime?: string;
}

export interface GameDefinition {
  id: string;
  name: string;
  code: string;
  metadata: GameMetadata;
}

export interface GameRegistry {
  [gameId: string]: GameDefinition;
}
