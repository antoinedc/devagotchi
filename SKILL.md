---
name: devagotchi
description: "Your living developer companion — a virtual pet that feeds on AI coding sessions. Commands: /devagotchi, /devagotchi feed, /devagotchi reset, /devagotchi stats, /devagotchi pet, /devagotchi name, /devagotchi fortune, /devagotchi trick"
disable-model-invocation: true
allowed-tools: Bash(node:*) Bash(bash:*)
---

# Devagotchi

A virtual pet that lives in Claude Code and grows as you code.

## Usage

Run the CLI with the appropriate command based on what the user asked:

```bash
node ${CLAUDE_SKILL_DIR}/dist/cli.js <command> [args]
```

### Commands

| User says | Command to run |
|-----------|---------------|
| `/devagotchi` (no args) | `node ${CLAUDE_SKILL_DIR}/dist/cli.js show` |
| `/devagotchi feed` | `node ${CLAUDE_SKILL_DIR}/dist/cli.js feed` |
| `/devagotchi stats` | `node ${CLAUDE_SKILL_DIR}/dist/cli.js stats` |
| `/devagotchi pet` | `node ${CLAUDE_SKILL_DIR}/dist/cli.js pet` |
| `/devagotchi name <name>` | `node ${CLAUDE_SKILL_DIR}/dist/cli.js name <name>` |
| `/devagotchi fortune` | `node ${CLAUDE_SKILL_DIR}/dist/cli.js fortune` |
| `/devagotchi trick` | `node ${CLAUDE_SKILL_DIR}/dist/cli.js trick` |
| `/devagotchi reset` | `node ${CLAUDE_SKILL_DIR}/dist/cli.js reset` |
| `/devagotchi dashboard` | `node ${CLAUDE_SKILL_DIR}/dist/cli.js dashboard` |

**Display the raw output exactly as printed** — preserve the ASCII art.

If `${CLAUDE_SKILL_DIR}/dist/cli.js` doesn't exist, run setup first:
```bash
cd ${CLAUDE_SKILL_DIR} && ./setup
```
