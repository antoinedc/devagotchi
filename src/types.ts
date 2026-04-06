export type Species = 'cat' | 'dragon' | 'robot';

export type EvolutionStage = 'egg' | 'baby' | 'teen' | 'adult' | 'elder' | 'mythic';

export type Mood = 'happy' | 'content' | 'hungry' | 'starving';

export type AnimationState = 'idle' | 'happy' | 'hungry' | 'sleeping' | 'eating';

export interface PetState {
  name: string;
  species: Species;
  stage: EvolutionStage;
  xp: number;
  hunger: number; // 0-100
  lastUpdated: number; // timestamp
  bornAt: number; // timestamp
  lastSyncedTokenTimestamp: number; // for adapter tracking
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  timestamp: number;
}

export interface AdapterResult {
  tokens: number;
  lastTimestamp: number;
}
