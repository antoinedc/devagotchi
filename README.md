# Devagotchi 🐾

> A terminal-resident virtual pet fed by AI coding tool token consumption

Devagotchi is your "Living Developer Companion" — a virtual pet that lives in your terminal and evolves based on how much you use AI coding tools like Claude Code. The more tokens you consume while coding, the more your pet grows!

## Features

- 🎮 **Virtual Pet System**: Three unique species (cat, dragon, robot) with ASCII art
- 📈 **Evolution System**: Egg → Baby → Teen → Adult → Elder → Mythic (based on token XP)
- 🍖 **Token-Based Feeding**: 1000 tokens = 1 food unit
- 😊 **Dynamic Moods**: Happy, content, hungry, or starving based on hunger level
- 🎨 **ASCII Art Animations**: Different frames for idle, happy, hungry, sleeping, and eating states
- 💾 **Local Storage**: All data stored locally in `~/.devagotchi/` - ZERO telemetry
- 🔌 **Adapter System**: Pluggable adapters for different AI tools (currently supports Claude Code)
- 🎪 **Pet Skills**: Fortune telling and tricks to interact with your companion

## Installation

### Quick Start (npx)

```bash
npx devagotchi
```

That's it. Your pet hatches on first run.

### Global Install

```bash
npm install -g devagotchi
```

Then just run `devagotchi` anywhere.

### From Source

```bash
git clone https://github.com/antoinedc/devagotchi.git
cd devagotchi
npm install
npm run build
npm link
```

### Requirements

- Node.js 18+
- **Claude Code** installed (for the token adapter) — [get it here](https://docs.anthropic.com/en/docs/claude-code)

## Usage

### Show Your Pet

```bash
devagotchi
```

Displays your pet with current stats, hunger bar, and XP progress.

### Feed Your Pet

```bash
devagotchi feed
```

Syncs with Claude Code to count tokens from your coding sessions and feeds your pet. Your pet gains XP (cumulative) and food based on token consumption.

### View Detailed Stats

```bash
devagotchi stats
```

Shows comprehensive information about your pet including:
- Name, species, and evolution stage
- Total XP and hunger level
- Current mood
- XP needed until next evolution
- Age in days

### Pet Your Companion

```bash
devagotchi pet
```

Show some love to your pet with a heart animation!

### Rename Your Pet

```bash
devagotchi name <name>
```

Give your pet a custom name.

### Run Skills

```bash
devagotchi skill fortune
devagotchi skill trick
```

- `fortune`: Get a random fortune about your coding day
- `trick`: Watch your pet perform a fun trick

## Evolution Stages

Your pet evolves as you accumulate XP (tokens):

| Stage | XP Threshold | Description |
|-------|-------------|-------------|
| 🥚 Egg | 0 | Your journey begins |
| 👶 Baby | 10,000 | First evolution |
| 🧒 Teen | 100,000 | Getting stronger |
| 🧑 Adult | 500,000 | Fully grown |
| 👴 Elder | 2,000,000 | Wise and powerful |
| ✨ Mythic | 10,000,000 | Ultimate form |

## Pet Mechanics

- **Hunger**: Depletes by 1 per hour, max 100
- **Feeding**: 1000 tokens = 1 food unit
- **Mood System**:
  - 😊 Happy (hunger > 70)
  - 😌 Content (hunger 40-70)
  - 😟 Hungry (hunger 20-40)
  - 😭 Starving (hunger < 20)
- **XP**: Cumulative total tokens consumed, never decreases

## Species

When your pet first hatches, it randomly becomes one of three species:

- 🐱 **Cat**: Playful and adorable
- 🐉 **Dragon**: Fierce and magical
- 🤖 **Robot**: Mechanical and precise

Each species has unique ASCII art for all evolution stages!

## Claude Code Adapter

The Claude Code adapter automatically tracks your token usage by reading JSONL session files from `~/.claude/projects/*/sessions/*/`. It counts both input and output tokens and ensures no double counting by tracking the last sync timestamp.

## Privacy

Devagotchi stores all data locally in `~/.devagotchi/state.json`. No telemetry, no external connections (except reading local Claude Code session files). Your pet lives entirely on your machine.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Test
npm test
```

## Project Structure

```
devagotchi/
├── src/
│   ├── adapters/
│   │   └── claudeCode.ts    # Claude Code token adapter
│   ├── types.ts             # TypeScript type definitions
│   ├── petEngine.ts         # Core pet state machine
│   ├── ascii.ts             # ASCII art renderer
│   ├── storage.ts           # Local storage system
│   ├── display.ts           # Terminal display utilities
│   ├── skills.ts            # Pet skills (fortune, trick)
│   ├── index.ts             # Main Devagotchi class
│   └── cli.ts               # CLI entry point
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## License

MIT

## Contributing

Contributions welcome! Feel free to open issues or submit PRs.

---

## Roadmap

- [ ] Codex CLI adapter
- [ ] Aider adapter
- [ ] Web dashboard with pet animation
- [ ] Desktop widget (macOS menu bar / Windows tray)
- [ ] More species and evolution branches
- [ ] Custom user skills (`~/.devagotchi/skills/`)
- [ ] Opt-in social: compare pets, leaderboards
- [ ] Starship prompt module

---

Made with ♥ by developers, for developers
