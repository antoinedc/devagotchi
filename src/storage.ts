import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PetState } from './types';

const STATE_DIR = path.join(os.homedir(), '.devagotchi');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

export class Storage {
  static ensureStateDir(): void {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
  }

  static loadState(): PetState | null {
    this.ensureStateDir();

    if (!fs.existsSync(STATE_FILE)) {
      return null;
    }

    try {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data) as PetState;
    } catch (error) {
      console.error('Error loading state:', error);
      return null;
    }
  }

  static saveState(state: PetState): void {
    this.ensureStateDir();

    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving state:', error);
      throw error;
    }
  }

  static getStateDir(): string {
    return STATE_DIR;
  }
}
