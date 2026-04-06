#!/usr/bin/env node
// Devagotchi Status Line for Claude Code
// Features: pet mood, hunger bar, streak, mood animations,
//           session tokens, time-aware quips, auto-feed

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const DEVAGOTCHI_DIR = path.join(os.homedir(), '.devagotchi');
const STATE_FILE = path.join(DEVAGOTCHI_DIR, 'state.json');
const THROTTLE_FILE = path.join(DEVAGOTCHI_DIR, '.last-autofeed');
const FED_FILE = path.join(DEVAGOTCHI_DIR, '.last-fed-tokens');
const STREAK_FILE = path.join(DEVAGOTCHI_DIR, '.streak');
const CLI = path.join(__dirname, '..', 'dist', 'cli.js');
const THROTTLE_MS = 5 * 60 * 1000;
const CLAUDE_DIR = path.join(os.homedir(), '.claude', 'projects');

// ─── Level calculation (must match dashboard.html) ───
const LEVEL_BASE = 300000;
const LEVEL_LOG = Math.log(1.6);
function getLevel(xp) {
  if (xp < LEVEL_BASE * 0.6) return 0;
  return Math.floor(Math.log(xp / LEVEL_BASE + 1) / LEVEL_LOG);
}
function getNextLevelXp(level) {
  return Math.floor(LEVEL_BASE * (Math.pow(1.6, level + 1) - 1));
}
function getCurrentLevelXp(level) {
  if (level === 0) return 0;
  return Math.floor(LEVEL_BASE * (Math.pow(1.6, level) - 1));
}

// Read JSON from stdin
let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input || '{}');

    if (!fs.existsSync(STATE_FILE)) {
      process.stdout.write('\x1b[2m🥚 No pet yet — run /devagotchi\x1b[0m');
      return;
    }

    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const name = state.name || 'Devagotchi';
    const hunger = state.hunger || 0;
    const xp = state.xp || 0;
    const species = state.species || '?';

    // ─── Current hunger ───
    const hoursSinceUpdate = (Date.now() - (state.lastUpdated || Date.now())) / (1000 * 60 * 60);
    const currentHunger = Math.max(0, Math.min(100, hunger - Math.floor(hoursSinceUpdate)));

    // ─── Species emoji ───
    const speciesEmoji = { cat: '🐱', dragon: '🐉', robot: '🤖' }[species] || '🥚';

    // ─── [1] Streak counter ───
    const streak = getStreak();

    // ─── [2] Mood animations (cycling expressions) ───
    const moodEmoji = getMoodAnimation(currentHunger, state);

    // ─── Hunger bar (3 segments for compactness) ───
    const filled = Math.round(currentHunger / 34);
    const bar = '█'.repeat(filled) + '░'.repeat(3 - filled);
    let coloredBar;
    if (currentHunger > 70) coloredBar = `\x1b[32m${bar}\x1b[0m`;
    else if (currentHunger > 40) coloredBar = `\x1b[33m${bar}\x1b[0m`;
    else if (currentHunger > 20) coloredBar = `\x1b[38;5;208m${bar}\x1b[0m`;
    else coloredBar = `\x1b[31m${bar}\x1b[0m`;

    // ─── [3] Next level progress ───
    const level = getLevel(xp);
    const curLvlXp = getCurrentLevelXp(level);
    const nextLvlXp = getNextLevelXp(level);
    const lvlPct = Math.min(100, Math.round(((xp - curLvlXp) / (nextLvlXp - curLvlXp)) * 100));
    const lvlFilled = Math.round(lvlPct / 25);
    const lvlBar = '▓'.repeat(lvlFilled) + '░'.repeat(4 - lvlFilled);
    const lvlStr = `\x1b[35mlv${level} ${lvlBar} ${lvlPct}%\x1b[0m`;

    // ─── [6] Time-based quip ───
    const quip = getTimeQuip(state);

    // ─── Level up notification ───
    let levelUpMsg = '';
    const levelUpFile = path.join(DEVAGOTCHI_DIR, '.levelup');
    try {
      if (fs.existsSync(levelUpFile)) {
        const levelUpTime = fs.statSync(levelUpFile).mtime.getTime();
        if (Date.now() - levelUpTime < 5 * 60 * 1000) {
          const newStage = fs.readFileSync(levelUpFile, 'utf8').trim();
          levelUpMsg = ` \x1b[1;33m⭐ EVOLVED → ${newStage}!\x1b[0m`;
          if (Date.now() - levelUpTime > 60 * 1000) fs.unlinkSync(levelUpFile);
        } else {
          fs.unlinkSync(levelUpFile);
        }
      }
    } catch (e) {}

    // ─── Fed notification ───
    let fedMsg = '';
    try {
      if (fs.existsSync(FED_FILE)) {
        const fedTime = fs.statSync(FED_FILE).mtime.getTime();
        const fedAge = Date.now() - fedTime;
        if (fedAge < 30 * 1000) {
          fedMsg = ` \x1b[1;32m🍖 +${fs.readFileSync(FED_FILE, 'utf8').trim()}\x1b[0m`;
        } else if (fedAge > 60 * 1000) {
          fs.unlinkSync(FED_FILE);
        }
      }
    } catch (e) {}

    // ─── Assemble output ───
    const streakStr = streak > 1 ? ` \x1b[38;5;208m🔥${streak}d\x1b[0m` : '';
    const quipStr = quip ? ` \x1b[2;3m${quip}\x1b[0m` : '';

    process.stdout.write(
      `${speciesEmoji} ${name} ${moodEmoji} ${coloredBar} ${lvlStr}${streakStr}${quipStr}${levelUpMsg}${fedMsg}`
    );

    // Record today for streak tracking
    recordToday();

    // Trigger background auto-feed
    tryBackgroundFeed();
  } catch (e) {
    // Silent fail
  }
});

// ─── [1] Streak: consecutive days with sessions ───
function getStreak() {
  try {
    if (!fs.existsSync(STREAK_FILE)) return 1;
    const data = JSON.parse(fs.readFileSync(STREAK_FILE, 'utf8'));
    return data.streak || 1;
  } catch (e) { return 1; }
}

function recordToday() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    let data = { lastDate: today, streak: 1 };

    if (fs.existsSync(STREAK_FILE)) {
      try { data = JSON.parse(fs.readFileSync(STREAK_FILE, 'utf8')); } catch (e) {}
    }

    if (data.lastDate === today) return; // Already recorded today

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (data.lastDate === yesterday) {
      data.streak = (data.streak || 1) + 1;
    } else {
      data.streak = 1; // Streak broken
    }
    data.lastDate = today;

    if (!fs.existsSync(DEVAGOTCHI_DIR)) fs.mkdirSync(DEVAGOTCHI_DIR, { recursive: true });
    fs.writeFileSync(STREAK_FILE, JSON.stringify(data));
  } catch (e) {}
}

// ─── [2] Mood animations: cycling expressions ───
function getMoodAnimation(hunger, state) {
  // Check for recent feed (eating animation)
  try {
    if (fs.existsSync(FED_FILE)) {
      const fedAge = Date.now() - fs.statSync(FED_FILE).mtime.getTime();
      if (fedAge < 15 * 1000) return '😋'; // Eating!
    }
  } catch (e) {}

  // Check for recent level up
  const levelUpFile = path.join(DEVAGOTCHI_DIR, '.levelup');
  try {
    if (fs.existsSync(levelUpFile)) {
      const age = Date.now() - fs.statSync(levelUpFile).mtime.getTime();
      if (age < 60 * 1000) return '🤩'; // Just evolved!
    }
  } catch (e) {}

  // Idle too long? Sleeping
  const hoursSince = (Date.now() - (state.lastUpdated || Date.now())) / (1000 * 60 * 60);
  if (hoursSince > 8) return '😴';

  // Cycle through mood-appropriate expressions
  const tick = Math.floor(Date.now() / 10000) % 4; // Changes every 10s

  if (hunger > 70) {
    return ['😊', '😄', '✨', '😊'][tick];
  } else if (hunger > 40) {
    return ['😌', '🙂', '😌', '💭'][tick];
  } else if (hunger > 20) {
    return ['😟', '😕', '🍽️', '😟'][tick];
  } else {
    return ['😭', '💀', '😭', '🆘'][tick];
  }
}

// ─── [6] Time-based quips ───
function getTimeQuip(state) {
  const hour = new Date().getHours();
  const personality = state.personality;
  const chronotype = personality?.chronotype || 'day-walker';

  // Only show quip ~25% of the time (changes every 40s)
  const slot = Math.floor(Date.now() / 40000) % 4;
  if (slot !== 0) return '';

  // Time-vs-chronotype quips
  if (hour >= 0 && hour < 5) {
    if (chronotype === 'night-owl') return '"peak hours 🌙"';
    return '"still up? 💤"';
  }
  if (hour >= 5 && hour < 8) {
    if (chronotype === 'early-bird') return '"let\'s go! ☀️"';
    return '"*yawn* ☕"';
  }
  if (hour >= 8 && hour < 12) {
    return ['', '"morning! ☀️"', '', '"let\'s build 🛠️"'][Math.floor(Date.now() / 60000) % 4];
  }
  if (hour >= 12 && hour < 14) {
    return '"lunch break? 🍕"';
  }
  if (hour >= 17 && hour < 19) {
    return '"wrapping up? 📦"';
  }
  if (hour >= 22) {
    if (chronotype === 'night-owl') return '"the night is young 🦇"';
    return '"bedtime? 🌙"';
  }

  // Session length quips
  const sessionStart = state.lastUpdated || Date.now();
  const sessionHours = (Date.now() - sessionStart) / (1000 * 60 * 60);
  if (sessionHours > 3) return '"marathon mode! 💪"';
  if (sessionHours > 1.5) return '"deep work 🧠"';

  return '';
}

// ─── Background auto-feed ───
function tryBackgroundFeed() {
  try {
    if (!fs.existsSync(CLI)) return;
    if (fs.existsSync(THROTTLE_FILE)) {
      const lastFeed = fs.statSync(THROTTLE_FILE).mtime.getTime();
      if (Date.now() - lastFeed < THROTTLE_MS) return;
    }
    if (!fs.existsSync(DEVAGOTCHI_DIR)) fs.mkdirSync(DEVAGOTCHI_DIR, { recursive: true });
    fs.writeFileSync(THROTTLE_FILE, '');

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
    const child = spawn('node', ['-e', feedScript], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch (e) {}
}
