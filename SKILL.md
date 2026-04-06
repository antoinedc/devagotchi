---
name: devagotchi
description: Your living developer companion — a virtual pet that feeds on your AI coding sessions. Use /devagotchi to interact with your pet.
---

# Devagotchi - Your AI Coding Companion

Devagotchi is a virtual pet that lives in Claude Code. It feeds on the tokens consumed during your coding sessions and evolves as you work.

## Commands

All commands are run via `/devagotchi <command>`. When the user types `/devagotchi` with a subcommand, run the corresponding shell script.

| User types | Run this |
|---|---|
| `/devagotchi` | `bash scripts/show.sh` |
| `/devagotchi show` | `bash scripts/show.sh` |
| `/devagotchi feed` | `bash scripts/feed.sh` |
| `/devagotchi stats` | `bash scripts/stats.sh` |
| `/devagotchi pet` | `bash scripts/pet.sh` |
| `/devagotchi name Sparkles` | `bash scripts/name.sh Sparkles` |
| `/devagotchi fortune` | `bash scripts/fortune.sh` |
| `/devagotchi trick` | `bash scripts/trick.sh` |
| `/devagotchi reset` | `bash scripts/reset.sh` |

**Always display the raw terminal output from the script to the user.** Do not summarize or reformat it — the ASCII art must be shown exactly as printed.

## What each command does

- **show** — Display pet ASCII art with stats, hunger bar, XP progress
- **feed** — Sync tokens from Claude Code sessions (since install) and feed pet
- **stats** — Detailed stats: XP, hunger, mood, evolution progress, age
- **pet** — Show love to your companion (heart animation)
- **name <name>** — Rename your pet
- **fortune** — Get a coding fortune
- **trick** — Pet performs an ASCII trick
- **reset** — Start over with a new pet (deletes all progress)

## Notes

- Pet only counts tokens from sessions AFTER installation (no retroactive XP)
- Hunger depletes over time — feed regularly by coding with Claude Code
- Pet evolves: Egg → Baby → Teen → Adult → Elder → Mythic
