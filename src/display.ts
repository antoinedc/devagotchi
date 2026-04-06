import chalk from 'chalk';
import { PetState, AnimationState } from './types';
import { PetEngine } from './petEngine';
import { AsciiRenderer } from './ascii';

export class Display {
  static showPet(state: PetState, animationState: AnimationState = 'idle'): void {
    const mood = PetEngine.getMood(state);
    const art = AsciiRenderer.render(state.species, state.stage, animationState);

    console.log('\n' + chalk.cyan(art) + '\n');
    console.log(chalk.bold.yellow(`${state.name}`) + chalk.gray(` the ${state.species}`));
    console.log(chalk.gray(`Stage: ${state.stage.toUpperCase()} | Mood: ${this.getMoodEmoji(mood)} ${mood}`));
    console.log('');
    console.log(this.getHungerBar(state.hunger));
    console.log(this.getXpBar(state));
    console.log('');
  }

  static showStats(state: PetState): void {
    console.log('\n' + chalk.bold.cyan('📊 Stats') + '\n');
    console.log(chalk.gray('Name:      ') + chalk.white(state.name));
    console.log(chalk.gray('Species:   ') + chalk.white(state.species));
    console.log(chalk.gray('Stage:     ') + chalk.white(state.stage.toUpperCase()));
    console.log(chalk.gray('XP:        ') + chalk.white(state.xp.toLocaleString()));
    console.log(chalk.gray('Hunger:    ') + chalk.white(Math.floor(state.hunger)) + '/100');
    console.log(chalk.gray('Mood:      ') + chalk.white(PetEngine.getMood(state)));

    const nextThreshold = PetEngine.getNextEvolutionThreshold(state.stage);
    if (nextThreshold) {
      const remaining = nextThreshold - state.xp;
      console.log(chalk.gray('Next evo:  ') + chalk.white(remaining.toLocaleString()) + ' XP');
    } else {
      console.log(chalk.gray('Next evo:  ') + chalk.magenta('MAX LEVEL! 🌟'));
    }

    const age = Math.floor((Date.now() - state.bornAt) / (1000 * 60 * 60 * 24));
    console.log(chalk.gray('Age:       ') + chalk.white(age) + ' days');

    if (state.personality) {
      const p = state.personality;
      console.log('');
      console.log(chalk.bold.cyan('🧬 Personality') + '\n');
      console.log(chalk.gray('Chronotype: ') + chalk.white(p.chronotype) + chalk.gray(` (peak hour: ${p.peakHour}:00)`));
      console.log(chalk.gray('Style:      ') + chalk.white(p.sessionStyle) + chalk.gray(` (avg ${p.avgSessionMin}min sessions)`));
      console.log(chalk.gray('Rhythm:     ') + chalk.white(p.rhythm) + chalk.gray(` (${p.sessionsPerWeek} sessions/week)`));
      console.log(chalk.gray('Schedule:   ') + chalk.white(p.schedule) + chalk.gray(` (${Math.round(p.weekdayRatio * 100)}% weekday)`));
      console.log(chalk.gray('Intensity:  ') + chalk.white(p.intensity) + chalk.gray(` (avg ${Math.round(p.avgTokensPerSession / 1000)}K tokens/session)`));
      console.log(chalk.gray('Pattern:    ') + chalk.white(p.pattern));
      console.log('');
      console.log(chalk.italic.yellow(`"${p.blurb}"`));
    }

    console.log('');
  }

  private static getHungerBar(hunger: number): string {
    const barLength = 20;
    const filled = Math.floor((hunger / 100) * barLength);
    const empty = barLength - filled;

    let color = chalk.green;
    if (hunger < 40) color = chalk.yellow;
    if (hunger < 20) color = chalk.red;

    const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    return chalk.gray('Hunger: ') + bar + chalk.gray(` ${Math.floor(hunger)}%`);
  }

  private static getXpBar(state: PetState): string {
    const nextThreshold = PetEngine.getNextEvolutionThreshold(state.stage);

    if (!nextThreshold) {
      return chalk.gray('XP:     ') + chalk.magenta('█'.repeat(20)) + chalk.gray(' MAX');
    }

    const currentStageThresholds: Record<string, number> = {
      egg: 0,
      baby: 10_000,
      teen: 100_000,
      adult: 500_000,
      elder: 2_000_000,
    };

    const currentThreshold = currentStageThresholds[state.stage] || 0;
    const progress = (state.xp - currentThreshold) / (nextThreshold - currentThreshold);
    const barLength = 20;
    const filled = Math.floor(progress * barLength);
    const empty = barLength - filled;

    const bar = chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    return chalk.gray('XP:     ') + bar + chalk.gray(` ${state.xp.toLocaleString()}`);
  }

  private static getMoodEmoji(mood: string): string {
    const emojis: Record<string, string> = {
      happy: '😊',
      content: '😌',
      hungry: '😟',
      starving: '😭',
    };
    return emojis[mood] || '😐';
  }

  static showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
    };

    console.log(colors[type](message));
  }

  static showEvolution(oldStage: string, newStage: string): void {
    console.log('\n' + chalk.bold.magenta('✨ EVOLUTION! ✨'));
    console.log(chalk.white(`${oldStage.toUpperCase()} → ${newStage.toUpperCase()}`));
    console.log('');
  }
}
