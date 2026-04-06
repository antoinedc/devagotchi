---
name: devagotchi
description: Your living developer companion — a virtual pet that feeds on your AI coding sessions. Run /devagotchi to see your pet.
---

# Devagotchi - Your AI Coding Companion

Devagotchi is a virtual pet that lives in Claude Code and grows stronger as you code. Your pet feeds on the tokens consumed during your AI coding sessions, evolving through different stages as you work together.

## How It Works

- **Automatic Growth**: Your pet gains XP from tokens used in Claude Code sessions (since installation)
- **Evolution Stages**: Watch your pet grow from egg → baby → teen → adult → elder → mythic
- **Hunger System**: Keep your pet fed by coding regularly with Claude Code
- **Interactive Commands**: Pet, rename, and interact with your companion

## Available Commands

### `/devagotchi` or `/devagotchi:show`
Show your current pet with its ASCII art, stats, and mood.

### `/devagotchi:feed`
Sync with Claude Code and feed your pet all the tokens earned since last feed. Watch for evolution!

### `/devagotchi:stats`
Display detailed statistics including XP, hunger level, age, and evolution progress.

### `/devagotchi:pet`
Give your companion some love and attention. They'll appreciate it!

### `/devagotchi:name <name>`
Rename your pet. Example: `/devagotchi:name Sparkles`

### `/devagotchi:fortune`
Get a coding fortune from your pet to inspire your next session.

### `/devagotchi:trick`
Watch your pet perform a fun ASCII art trick!

## Installation

1. Clone this repository to your Claude Code skills directory:
```bash
git clone https://github.com/antoinedc/devagotchi.git ~/.claude/skills/devagotchi
```

2. Install dependencies and build:
```bash
cd ~/.claude/skills/devagotchi
npm install
npm run build
```

3. Restart Claude Code or reload skills

4. Run `/devagotchi` to initialize your pet!

## Important Notes

- **No Retroactive XP**: Your pet only counts tokens from Claude Code sessions that happen AFTER you install Devagotchi. This ensures fair gameplay and gives you a fresh start.
- **Keep Coding**: Your pet gets hungry over time. Regular coding sessions keep them happy and healthy!
- **Evolution**: Different species (cat, dragon, robot) can emerge based on your pet's journey.

## Tips

- Run `/devagotchi:feed` after each coding session to keep your pet well-fed
- Check `/devagotchi:stats` to see how close you are to the next evolution
- Use `/devagotchi:fortune` when you need inspiration for your next feature
- Remember to `/devagotchi:pet` your companion occasionally — they appreciate the attention!

---

Enjoy your journey with your new coding companion!
