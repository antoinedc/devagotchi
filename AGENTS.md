# Devagotchi — Build Spec

You are building Devagotchi — a terminal-resident virtual pet fed by AI coding tool token consumption. "Living Developer Companion."

## What to build
A TypeScript/Node.js CLI tool called `devagotchi`:
1. Virtual pet that lives in your terminal with ASCII art
2. Fed by AI coding tool usage (token consumption)
3. Pet states: hunger (depletes over time), mood, XP (cumulative)
4. Evolution: Egg (0) → Baby (10K) → Teen (100K) → Adult (500K) → Elder (2M) → Mythic (10M)
5. ASCII art with animation frames (3 species: cat, dragon, robot)
6. Local storage in `~/.devagotchi/state.json` — ZERO telemetry

## Architecture
- **Core engine**: pet state machine, hunger/mood/XP, ASCII rendering, evolution
- **Adapter system**: pluggable adapters that read token usage from AI tools
- **Claude Code adapter** (v1): parse JSONL files from `~/.claude/projects/` to count tokens
- **Skills system**: built-in pet commands

## CLI commands
- `devagotchi` — show pet with ASCII art and status
- `devagotchi feed` — sync from adapters and feed
- `devagotchi stats` — usage breakdown
- `devagotchi pet` — pet your companion (heart animation)
- `devagotchi name <name>` — name your pet
- `devagotchi skill <name>` — run a skill (fortune, trick)

## Tech
- TypeScript, compile with tsup
- chalk for colors
- Store state in `~/.devagotchi/state.json`
- npx-runnable (package.json bin entry)
- Good README.md

## Pet mechanics
- 1000 tokens = 1 food unit
- Hunger depletes: -1 per hour. Max 100.
- Mood: happy (>70), content (40-70), hungry (20-40), starving (<20)
- XP: cumulative total tokens, never decreases
- Evolution at XP thresholds

## Claude Code adapter
- Read JSONL from `~/.claude/projects/*/sessions/*/`
- Each line has usage with input_tokens, output_tokens
- Sum tokens, convert to food/XP
- Track last-synced timestamp (no double counting)

## ASCII Art
3 species (random at first hatch): Cat, Dragon, Robot
Each needs frames for: idle, happy, hungry, sleeping, eating
Make them cute and fun in terminal.

## Rules
- Commit after each major milestone with conventional commits
- Make it work end-to-end before polishing
- Keep it simple — this is an MVP
