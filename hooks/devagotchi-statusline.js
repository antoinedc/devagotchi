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

    // ─── Time-based behavior ───
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
      `${speciesEmoji} ${name} ${moodEmoji} ${coloredBar}${streakStr}${quipStr}${levelUpMsg}${fedMsg}`
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

// ─── Time-based behavior ───
// Pet reacts to the time of day, adjusted by personality chronotype.
// Rotates between a few quips per time block every 30s so it feels alive.
function getTimeQuip(state) {
  const hour = new Date().getHours();
  const personality = state.personality;
  const chronotype = personality?.chronotype || 'day-walker';
  const tick = Math.floor(Date.now() / 30000) % 3; // Rotates every 30s

  // Session duration awareness
  const sessionStart = state.lastUpdated || Date.now();
  const sessionHours = (Date.now() - sessionStart) / (1000 * 60 * 60);

  // Session-length quips take priority
  if (sessionHours > 4) return ['"we\'ve been at this all day!"', '"take a break?"', '"marathon mode 💪"'][tick];
  if (sessionHours > 2) return ['"deep work mode 🧠"', '"in the zone"', '"focused 🎯"'][tick];

  // Late night (midnight–5am)
  if (hour >= 0 && hour < 5) {
    if (chronotype === 'night-owl') return ['"peak hours 🌙"', '"the night is ours"', '"let\'s ship it 🚀"'][tick];
    return ['"still up? 💤"', '"zzz..."', '"sleep soon?"'][tick];
  }

  // Early morning (5–8am)
  if (hour >= 5 && hour < 8) {
    if (chronotype === 'early-bird') return ['"let\'s go! ☀️"', '"early start!"', '"fresh code ✨"'][tick];
    return ['"*yawn* ☕"', '"too early..."', '"need coffee"'][tick];
  }

  // Morning (8am–noon)
  if (hour >= 8 && hour < 12) {
    return ['"good morning ☀️"', '"let\'s build 🛠️"', '"ready to code"'][tick];
  }

  // Lunch (noon–2pm)
  if (hour >= 12 && hour < 14) {
    return ['"lunch break? 🍕"', '"hungry..."', '"food first?"'][tick];
  }

  // Afternoon (2–5pm)
  if (hour >= 14 && hour < 17) {
    return ['"afternoon grind"', '"shipping mode 📦"', '"heads down"'][tick];
  }

  // Evening (5–8pm)
  if (hour >= 17 && hour < 20) {
    return ['"evening session"', '"wrapping up?"', '"one more thing..."'][tick];
  }

  // Night (8–10pm)
  if (hour >= 20 && hour < 22) {
    if (chronotype === 'night-owl') return ['"warming up 🌙"', '"prime time"', '"let\'s go"'][tick];
    return ['"winding down"', '"last push?"', '"almost done?"'][tick];
  }

  // Late evening (10pm–midnight)
  if (chronotype === 'night-owl') return ['"the night is young 🦇"', '"peak hours 🌙"', '"unstoppable"'][tick];
  return ['"bedtime? 🌙"', '"late one tonight"', '"burning midnight oil"'][tick];
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
