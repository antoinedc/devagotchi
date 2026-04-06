---
name: devagotchi
description: Show your Devagotchi — a virtual pet that feeds on your AI coding sessions. Also available: /devagotchi-feed, /devagotchi-stats, /devagotchi-pet, /devagotchi-fortune, /devagotchi-trick, /devagotchi-name, /devagotchi-reset
disable-model-invocation: true
allowed-tools: Bash(node:*) Bash(bash:*)
---

# Devagotchi 🐾

Show your virtual pet with ASCII art, stats, hunger bar, and XP progress.

Run: `bash ${CLAUDE_SKILL_DIR}/scripts/show.sh`

**Display the raw output exactly as printed** — preserve the ASCII art.

If `${CLAUDE_SKILL_DIR}/dist/cli.js` doesn't exist, run setup first:
```bash
cd ${CLAUDE_SKILL_DIR} && ./setup
```
