#!/usr/bin/env node

import { Devagotchi } from './index';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const devagotchi = new Devagotchi();

  try {
    switch (command) {
      case 'feed':
        await devagotchi.feed();
        break;

      case 'stats':
        devagotchi.stats();
        break;

      case 'pet':
        devagotchi.pet();
        break;

      case 'name':
        if (!args[1]) {
          console.error('Please provide a name: devagotchi name <name>');
          process.exit(1);
        }
        devagotchi.rename(args[1]);
        break;

      case 'skill':
        if (!args[1]) {
          console.error('Please provide a skill: devagotchi skill <fortune|trick>');
          process.exit(1);
        }
        devagotchi.skill(args[1]);
        break;

      case undefined:
        await devagotchi.show();
        break;

      default:
        console.log('Devagotchi - Your AI-powered terminal pet 🐾\n');
        console.log('Commands:');
        console.log('  devagotchi          - Show your pet');
        console.log('  devagotchi feed     - Sync tokens and feed your pet');
        console.log('  devagotchi stats    - Show detailed stats');
        console.log('  devagotchi pet      - Pet your companion');
        console.log('  devagotchi name <n> - Rename your pet');
        console.log('  devagotchi skill <s> - Run a skill (fortune, trick)');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
