---
name: devagotchi-name
description: Rename your Devagotchi. Usage: /devagotchi-name <new-name>
argument-hint: <name>
disable-model-invocation: true
allowed-tools: Bash(node:*) Bash(bash:*)
---

Rename your pet.

Run: `bash ${CLAUDE_SKILL_DIR}/../scripts/name.sh $ARGUMENTS`

Display the raw output exactly as printed.
