#!/usr/bin/env node
// Devagotchi Auto-Feed Hook
// Runs on Claude Code Stop event — automatically feeds your pet
// with tokens from the session that just finished.

const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');

const CLI = path.join(__dirname, '..', 'dist', 'cli.js');

// Only feed if the build exists
const fs = require('fs');
if (!fs.existsSync(CLI)) process.exit(0);

// Throttle: don't feed more than once per 5 minutes
const THROTTLE_FILE = path.join(os.homedir(), '.devagotchi', '.last-autofeed');
const THROTTLE_MS = 5 * 60 * 1000;

try {
  if (fs.existsSync(THROTTLE_FILE)) {
    const lastFeed = fs.statSync(THROTTLE_FILE).mtime.getTime();
    if (Date.now() - lastFeed < THROTTLE_MS) {
      process.exit(0); // Too soon, skip
    }
  }

  // Run feed silently
  execFileSync('node', [CLI, 'feed'], {
    stdio: 'ignore',
    timeout: 10000,
  });

  // Update throttle marker
  const dir = path.dirname(THROTTLE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(THROTTLE_FILE, '');
} catch (e) {
  // Silent fail — never break the user's session
}
