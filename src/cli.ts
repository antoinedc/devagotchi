#!/usr/bin/env node

import { showCommand } from './commands/show';
import { feedCommand } from './commands/feed';
import { statsCommand } from './commands/stats';
import { petCommand } from './commands/pet';
import { nameCommand } from './commands/name';
import { fortuneCommand } from './commands/fortune';
import { trickCommand } from './commands/trick';
import { resetCommand } from './commands/reset';
import { dashboardCommand } from './commands/dashboard';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'show':
      case undefined:
        await showCommand();
        break;

      case 'feed':
        await feedCommand();
        break;

      case 'stats':
        await statsCommand();
        break;

      case 'pet':
        await petCommand();
        break;

      case 'name':
        await nameCommand(args[1]);
        break;

      case 'fortune':
        await fortuneCommand();
        break;

      case 'trick':
        await trickCommand();
        break;

      case 'reset':
        await resetCommand();
        break;

      case 'dashboard':
        await dashboardCommand();
        break;

      default:
        console.log('Devagotchi - Your AI-powered terminal pet 🐾\n');
        console.log('Commands:');
        console.log('  devagotchi          - Show your pet');
        console.log('  devagotchi feed     - Sync tokens and feed your pet');
        console.log('  devagotchi stats    - Show detailed stats');
        console.log('  devagotchi pet      - Pet your companion');
        console.log('  devagotchi name <n> - Rename your pet');
        console.log('  devagotchi fortune  - Get a coding fortune');
        console.log('  devagotchi trick    - Watch your pet do a trick');
        console.log('  devagotchi reset    - Start over with a new pet');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
