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
  installedAt: number; // timestamp when devagotchi was first installed
  lastSyncedTokenTimestamp: number; // for adapter tracking
  personality?: PersonalityTraits; // derived from usage patterns
}

export interface PersonalityTraits {
  peakHour: number;
  chronotype: 'early-bird' | 'day-walker' | 'night-owl' | 'all-hours';
  avgSessionMin: number;
  sessionStyle: 'sprinter' | 'steady' | 'marathoner';
  sessionsPerWeek: number;
  rhythm: 'daily-grinder' | 'regular' | 'sporadic' | 'binge-coder';
  weekdayRatio: number;
  schedule: 'weekday-warrior' | 'balanced' | 'weekend-hacker';
  avgTokensPerSession: number;
  intensity: 'minimalist' | 'balanced' | 'deep-diver' | 'token-furnace';
  consistency: number;
  pattern: 'clockwork' | 'habitual' | 'free-spirit' | 'chaotic';
  blurb: string;
  analyzedAt: number;
  sessionCount: number;
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
