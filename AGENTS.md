# Devagotchi — Refactor to Claude Code Skill

## CRITICAL CHANGES NEEDED

### 1. Convert to a Claude Code Skill
Devagotchi should NOT be a standalone CLI. It lives entirely inside Claude Code as a skill.

**Structure:**
```
devagotchi/
├── SKILL.md              # Main skill file (Claude Code reads this)
├── scripts/
│   ├── show.sh           # devagotchi:show
│   ├── feed.sh           # devagotchi:feed  
│   ├── stats.sh          # devagotchi:stats
│   ├── pet.sh            # devagotchi:pet
│   ├── name.sh           # devagotchi:name
│   ├── fortune.sh        # devagotchi:fortune
│   ├── trick.sh          # devagotchi:trick
│   └── install.sh        # First-time setup
├── src/                  # TypeScript source (compiled to dist/)
│   ├── core/
│   │   ├── types.ts
│   │   ├── petEngine.ts
│   │   ├── storage.ts
│   │   └── ascii.ts
│   ├── adapters/
│   │   └── claudeCode.ts
│   ├── commands/
│   │   ├── show.ts
│   │   ├── feed.ts
│   │   ├── stats.ts
│   │   ├── pet.ts
│   │   ├── fortune.ts
│   │   └── trick.ts
│   └── cli.ts            # Entry point for all commands
├── dist/                 # Compiled JS
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

### 2. SKILL.md format
The SKILL.md should follow Claude Code's skill format:
```yaml
---
name: devagotchi
description: Your living developer companion — a virtual pet that feeds on your AI coding sessions. Run /devagotchi to see your pet.
---
```

The SKILL.md should tell Claude about all available commands:
- `/devagotchi` or `/devagotchi:show` — Show your pet
- `/devagotchi:feed` — Sync tokens and feed
- `/devagotchi:stats` — Detailed stats
- `/devagotchi:pet` — Pet your companion
- `/devagotchi:name <name>` — Rename
- `/devagotchi:fortune` — Get a coding fortune
- `/devagotchi:trick` — Watch pet do a trick

Each command runs the compiled Node.js code via the shell scripts.

### 3. NO RETROACTIVE XP — THIS IS CRITICAL
When installed for the first time, record the current timestamp in `~/.devagotchi/state.json` as `installedAt`. 
The Claude Code adapter MUST only count tokens from sessions created AFTER `installedAt`.
Do NOT count any past sessions. The pet starts from zero, from NOW.

### 4. Installation
Users install via:
```bash
# Clone to Claude Code skills directory
git clone https://github.com/antoinedc/devagotchi.git ~/.claude/skills/devagotchi
cd ~/.claude/skills/devagotchi && npm install && npm run build
```

Or via a marketplace command if available.

### 5. Shell scripts
Each script in `scripts/` should be simple wrappers:
```bash
#!/bin/bash
node "$(dirname "$0")/../dist/cli.js" show
```

### 6. Keep the existing code
Don't rewrite from scratch. Refactor:
- Move commands into separate files under `src/commands/`
- Update `src/cli.ts` to accept command as first arg
- Add `installedAt` timestamp to state and filter in adapter
- Create SKILL.md
- Create shell scripts for each command
- Update README with skill installation instructions

Commit each change separately with conventional commits.
