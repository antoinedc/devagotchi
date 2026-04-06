---
name: devagotchi
description: Your living developer companion — a virtual pet that feeds on your AI coding sessions. Invoke with /devagotchi to see your pet, or /devagotchi <command> for specific actions.
disable-model-invocation: true
allowed-tools: Bash(node:*) Bash(bash:*)
---

# Devagotchi 🐾

A virtual pet that lives in Claude Code and evolves based on your token consumption.

## Usage

When the user invokes `/devagotchi`, run the appropriate script based on `$ARGUMENTS`:

| $ARGUMENTS | Command |
|---|---|
| _(empty)_ | `bash ${CLAUDE_SKILL_DIR}/scripts/show.sh` |
| `show` | `bash ${CLAUDE_SKILL_DIR}/scripts/show.sh` |
| `feed` | `bash ${CLAUDE_SKILL_DIR}/scripts/feed.sh` |
| `stats` | `bash ${CLAUDE_SKILL_DIR}/scripts/stats.sh` |
| `pet` | `bash ${CLAUDE_SKILL_DIR}/scripts/pet.sh` |
| `name <name>` | `bash ${CLAUDE_SKILL_DIR}/scripts/name.sh <name>` |
| `fortune` | `bash ${CLAUDE_SKILL_DIR}/scripts/fortune.sh` |
| `trick` | `bash ${CLAUDE_SKILL_DIR}/scripts/trick.sh` |
| `reset` | `bash ${CLAUDE_SKILL_DIR}/scripts/reset.sh` |

**Always display the raw terminal output exactly as printed** — the ASCII art must be preserved.

## First Run

On first invocation, the pet hatches as a random species (cat, dragon, or robot) starting from Egg with 0 XP. Only tokens consumed AFTER installation count toward feeding.

## Setup

If `${CLAUDE_SKILL_DIR}/dist/cli.js` doesn't exist, run setup first:

```bash
cd ${CLAUDE_SKILL_DIR} && npm install && npm run build
```

## Commands

- **show** — Pet ASCII art with stats, hunger bar, XP
- **feed** — Sync tokens from Claude Code sessions and feed pet
- **stats** — XP, hunger, mood, evolution progress, age
- **pet** — Show love (heart animation)
- **name `<name>`** — Rename your pet
- **fortune** — Coding fortune from your pet
- **trick** — ASCII trick animation
- **reset** — Delete progress, hatch a new pet
