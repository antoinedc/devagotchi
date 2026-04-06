import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';

const STATE_DIR = path.join(os.homedir(), '.devagotchi');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

export async function resetCommand(): Promise<void> {
  if (!fs.existsSync(STATE_FILE)) {
    console.log(chalk.yellow('No pet found. Nothing to reset.'));
    return;
  }

  // Delete state file
  fs.unlinkSync(STATE_FILE);

  console.log(chalk.red('💥 Your Devagotchi has been released into the wild...'));
  console.log();
  console.log(chalk.green('🥚 Run /devagotchi to hatch a new pet!'));
}
