import { PetState } from './types';
import { PetEngine } from './petEngine';
import { Storage } from './storage';
import { ClaudeCodeAdapter } from './adapters/claudeCode';
import { Display } from './display';
import { AsciiRenderer } from './ascii';
import { Skills } from './skills';

export class Devagotchi {
  private state: PetState;

  constructor() {
    let state = Storage.loadState();

    if (!state) {
      state = PetEngine.createNewPet();
      Storage.saveState(state);
    }

    // Update hunger based on time passed
    state = PetEngine.updateHunger(state);

    this.state = state;
  }

  async show(): Promise<void> {
    const mood = PetEngine.getMood(this.state);
    let animationState: 'idle' | 'happy' | 'hungry' | 'sleeping' | 'eating' = 'idle';

    if (mood === 'happy') animationState = 'happy';
    else if (mood === 'hungry' || mood === 'starving') animationState = 'hungry';

    Display.showPet(this.state, animationState);
    this.save();
  }

  async feed(): Promise<void> {
    Display.showMessage('🍖 Syncing with Claude Code...', 'info');

    const result = await ClaudeCodeAdapter.getTokensSinceTimestamp(
      this.state.lastSyncedTokenTimestamp,
      this.state.installedAt
    );

    if (result.tokens === 0) {
      Display.showMessage('No new tokens to feed! Keep coding! 💻', 'warning');
      return;
    }

    const oldStage = this.state.stage;
    this.state = PetEngine.feedPet(this.state, result.tokens);
    this.state.lastSyncedTokenTimestamp = result.lastTimestamp;

    Display.showMessage(`✨ Fed ${result.tokens.toLocaleString()} tokens!`, 'success');

    if (oldStage !== this.state.stage) {
      Display.showEvolution(oldStage, this.state.stage);
    }

    Display.showPet(this.state, 'eating');
    this.save();
  }

  stats(): void {
    Display.showStats(this.state);
  }

  pet(): void {
    console.log('\n' + AsciiRenderer.renderHeart() + '\n');
    Display.showMessage(`${this.state.name} feels loved! ♥`, 'success');
  }

  rename(newName: string): void {
    this.state.name = newName;
    Display.showMessage(`Pet renamed to ${newName}! 🏷️`, 'success');
    this.save();
  }

  skill(skillName: string): void {
    if (skillName === 'fortune') {
      const fortune = Skills.fortune();
      console.log('\n🔮 ' + fortune + '\n');
    } else if (skillName === 'trick') {
      const trick = Skills.trick();
      console.log('\n' + trick + '\n');
    } else {
      Display.showMessage(`Unknown skill: ${skillName}. Try 'fortune' or 'trick'.`, 'error');
    }
  }

  private save(): void {
    Storage.saveState(this.state);
  }
}
