import { PetState, EvolutionStage, Mood, Species } from './types';

const EVOLUTION_THRESHOLDS: Record<EvolutionStage, number> = {
  egg: 0,
  baby: 10_000,
  teen: 100_000,
  adult: 500_000,
  elder: 2_000_000,
  mythic: 10_000_000,
};

const TOKENS_PER_FOOD = 1000;
const HUNGER_DEPLETION_PER_HOUR = 1;
const MAX_HUNGER = 100;

export class PetEngine {
  static createNewPet(species?: Species): PetState {
    const randomSpecies: Species[] = ['cat', 'dragon', 'robot'];
    const selectedSpecies = species || randomSpecies[Math.floor(Math.random() * randomSpecies.length)];

    const now = Date.now();
    return {
      name: 'Devagotchi',
      species: selectedSpecies,
      stage: 'egg',
      xp: 0,
      hunger: 100,
      lastUpdated: now,
      bornAt: now,
      lastSyncedTokenTimestamp: 0,
    };
  }

  static updateHunger(state: PetState): PetState {
    const now = Date.now();
    const hoursPassed = (now - state.lastUpdated) / (1000 * 60 * 60);
    const hungerDepletion = hoursPassed * HUNGER_DEPLETION_PER_HOUR;

    return {
      ...state,
      hunger: Math.max(0, state.hunger - hungerDepletion),
      lastUpdated: now,
    };
  }

  static feedPet(state: PetState, tokens: number): PetState {
    const foodUnits = Math.floor(tokens / TOKENS_PER_FOOD);
    const newXp = state.xp + tokens;
    const newHunger = Math.min(MAX_HUNGER, state.hunger + foodUnits);
    const newStage = this.calculateStage(newXp);

    return {
      ...state,
      xp: newXp,
      hunger: newHunger,
      stage: newStage,
      lastUpdated: Date.now(),
    };
  }

  static calculateStage(xp: number): EvolutionStage {
    if (xp >= EVOLUTION_THRESHOLDS.mythic) return 'mythic';
    if (xp >= EVOLUTION_THRESHOLDS.elder) return 'elder';
    if (xp >= EVOLUTION_THRESHOLDS.adult) return 'adult';
    if (xp >= EVOLUTION_THRESHOLDS.teen) return 'teen';
    if (xp >= EVOLUTION_THRESHOLDS.baby) return 'baby';
    return 'egg';
  }

  static getMood(state: PetState): Mood {
    if (state.hunger > 70) return 'happy';
    if (state.hunger > 40) return 'content';
    if (state.hunger > 20) return 'hungry';
    return 'starving';
  }

  static getNextEvolutionThreshold(stage: EvolutionStage): number | null {
    const stages: EvolutionStage[] = ['egg', 'baby', 'teen', 'adult', 'elder', 'mythic'];
    const currentIndex = stages.indexOf(stage);
    if (currentIndex === stages.length - 1) return null;
    return EVOLUTION_THRESHOLDS[stages[currentIndex + 1]];
  }
}
