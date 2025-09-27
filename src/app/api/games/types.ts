export interface GameMetadata {
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  icon: string;
  category?: string;
  tags?: string[];
  estimatedPlayTime?: string;
  // Payment fields
  isPaid?: boolean;
  price?: {
    amount: string;
    currency: "USDC";
    chainId?: number;
  };
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
