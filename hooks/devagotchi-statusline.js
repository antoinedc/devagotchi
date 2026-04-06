#!/usr/bin/env node
// Devagotchi Status Line for Claude Code
// Shows pet name, mood emoji, hunger bar, and evolution stage
// Also triggers background auto-feed during sessions

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const STATE_FILE = path.join(os.homedir(), '.devagotchi', 'state.json');
const DEVAGOTCHI_DIR = path.join(os.homedir(), '.devagotchi');
const THROTTLE_FILE = path.join(DEVAGOTCHI_DIR, '.last-autofeed');
const FED_FILE = path.join(DEVAGOTCHI_DIR, '.last-fed-tokens');
const CLI = path.join(__dirname, '..', 'dist', 'cli.js');
const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

// Read JSON from stdin (Claude Code sends session data)
let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    // Load pet state
    if (!fs.existsSync(STATE_FILE)) {
      process.stdout.write('\x1b[2m🥚 No pet yet — run /devagotchi\x1b[0m');
      return;
    }

    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const name = state.name || 'Devagotchi';
    const hunger = state.hunger || 0;
    const xp = state.xp || 0;
    const stage = state.stage || 'EGG';
    const species = state.species || '?';

    // Calculate current hunger (depletes over time)
    const hoursSinceLastFeed = (Date.now() - (state.lastFeedTime || Date.now())) / (1000 * 60 * 60);
    const currentHunger = Math.max(0, Math.min(100, hunger - Math.floor(hoursSinceLastFeed)));

    // Mood emoji
    let mood;
    if (currentHunger > 70) mood = '😊';
    else if (currentHunger > 40) mood = '😌';
    else if (currentHunger > 20) mood = '😟';
    else mood = '😭';

    // Species emoji
    const speciesEmoji = {
      cat: '🐱',
      dragon: '🐉',
      robot: '🤖'
    }[species] || '🥚';

    // Mini hunger bar (5 segments)
    const filled = Math.round(currentHunger / 20);
    const bar = '█'.repeat(filled) + '░'.repeat(5 - filled);

    // Color hunger bar
    let coloredBar;
    if (currentHunger > 70) {
      coloredBar = `\x1b[32m${bar}\x1b[0m`; // green
    } else if (currentHunger > 40) {
      coloredBar = `\x1b[33m${bar}\x1b[0m`; // yellow
    } else if (currentHunger > 20) {
      coloredBar = `\x1b[38;5;208m${bar}\x1b[0m`; // orange
    } else {
      coloredBar = `\x1b[31m${bar}\x1b[0m`; // red
    }

    // Format XP
    let xpStr;
    if (xp >= 1000000) xpStr = (xp / 1000000).toFixed(1) + 'M';
    else if (xp >= 1000) xpStr = (xp / 1000).toFixed(1) + 'K';
    else xpStr = String(xp);

    // Check for recent level up (within last 5 min)
    const levelUpFile = path.join(os.homedir(), '.devagotchi', '.levelup');
    let levelUpMsg = '';
    if (fs.existsSync(levelUpFile)) {
      try {
        const levelUpTime = fs.statSync(levelUpFile).mtime.getTime();
        if (Date.now() - levelUpTime < 5 * 60 * 1000) {
          const newStage = fs.readFileSync(levelUpFile, 'utf8').trim();
          levelUpMsg = ` \x1b[1;33m⭐ EVOLVED → ${newStage}!\x1b[0m`;
          // Clear after showing
          if (Date.now() - levelUpTime > 60 * 1000) {
            fs.unlinkSync(levelUpFile);
          }
        } else {
          fs.unlinkSync(levelUpFile);
        }
      } catch (e) {}
    }

    // Check if pet was recently fed (show brief feedback)
    let fedMsg = '';
    try {
      if (fs.existsSync(FED_FILE)) {
        const fedTime = fs.statSync(FED_FILE).mtime.getTime();
        const fedAge = Date.now() - fedTime;
        if (fedAge < 30 * 1000) { // Show for 30 seconds
          const fedTokens = fs.readFileSync(FED_FILE, 'utf8').trim();
          fedMsg = ` \x1b[1;32m🍖 +${fedTokens} tokens!\x1b[0m`;
        } else if (fedAge > 60 * 1000) {
          fs.unlinkSync(FED_FILE); // Clean up old marker
        }
      }
    } catch (e) {}

    process.stdout.write(`${speciesEmoji} ${name} ${mood} ${coloredBar} ${xpStr}xp${levelUpMsg}${fedMsg}`);

    // Trigger background auto-feed (throttled)
    tryBackgroundFeed();
  } catch (e) {
    // Silent fail
  }
});

function tryBackgroundFeed() {
  try {
    if (!fs.existsSync(CLI)) return;

    // Check throttle
    if (fs.existsSync(THROTTLE_FILE)) {
      const lastFeed = fs.statSync(THROTTLE_FILE).mtime.getTime();
      if (Date.now() - lastFeed < THROTTLE_MS) return;
    }

    // Update throttle marker immediately (prevent concurrent triggers)
    if (!fs.existsSync(DEVAGOTCHI_DIR)) fs.mkdirSync(DEVAGOTCHI_DIR, { recursive: true });
    fs.writeFileSync(THROTTLE_FILE, '');

    // Snapshot XP before feed
    let xpBefore = 0;
    try {
      const stateBefore = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      xpBefore = stateBefore.xp || 0;
    } catch (e) {}

    // Run feed as a detached process so it survives after statusline exits
    // It writes .last-fed-tokens marker for the next status refresh to pick up
    const feedScript = `
      const fs = require('fs');
      try {
        const stateBefore = JSON.parse(fs.readFileSync('${STATE_FILE}', 'utf8'));
        const xpBefore = stateBefore.xp || 0;
        require('child_process').execFileSync('node', ['${CLI}', 'feed'], { timeout: 10000, stdio: 'ignore' });
        const stateAfter = JSON.parse(fs.readFileSync('${STATE_FILE}', 'utf8'));
        const gained = (stateAfter.xp || 0) - xpBefore;
        if (gained > 0) {
          let s; if (gained >= 1e6) s = (gained/1e6).toFixed(1)+'M'; else if (gained >= 1e3) s = (gained/1e3).toFixed(1)+'K'; else s = String(gained);
          fs.writeFileSync('${FED_FILE}', s);
        }
      } catch(e) {}
    `;
    const child = spawn('node', ['-e', feedScript], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  } catch (e) {
    // Silent fail — never break the status line
  }
}
