import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AdapterResult, TokenUsage } from '../types';

const CLAUDE_DIR = path.join(os.homedir(), '.claude', 'projects');

export class ClaudeCodeAdapter {
  static async getTokensSinceTimestamp(lastTimestamp: number): Promise<AdapterResult> {
    let totalTokens = 0;
    let maxTimestamp = lastTimestamp;

    try {
      if (!fs.existsSync(CLAUDE_DIR)) {
        return { tokens: 0, lastTimestamp };
      }

      const projectDirs = fs.readdirSync(CLAUDE_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(CLAUDE_DIR, dirent.name));

      for (const projectDir of projectDirs) {
        // Check for JSONL files directly in project dir (current Claude Code structure)
        const files = fs.readdirSync(projectDir)
          .filter(file => file.endsWith('.jsonl'));

        for (const file of files) {
          const filePath = path.join(projectDir, file);
          const result = this.parseJsonlFile(filePath, lastTimestamp);
          totalTokens += result.tokens;
          maxTimestamp = Math.max(maxTimestamp, result.lastTimestamp);
        }

        // Also check sessions subdirectory (legacy/future structure)
        const sessionsDir = path.join(projectDir, 'sessions');
        if (fs.existsSync(sessionsDir)) {
          const sessionDirs = fs.readdirSync(sessionsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(sessionsDir, dirent.name));

          for (const sessionDir of sessionDirs) {
            const sessionFiles = fs.readdirSync(sessionDir)
              .filter(file => file.endsWith('.jsonl'));

            for (const file of sessionFiles) {
              const filePath = path.join(sessionDir, file);
              const result = this.parseJsonlFile(filePath, lastTimestamp);
              totalTokens += result.tokens;
              maxTimestamp = Math.max(maxTimestamp, result.lastTimestamp);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading Claude Code data:', error);
    }

    return { tokens: totalTokens, lastTimestamp: maxTimestamp };
  }

  private static parseJsonlFile(filePath: string, lastTimestamp: number): AdapterResult {
    let tokens = 0;
    let maxTimestamp = lastTimestamp;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const record = JSON.parse(line);

          // Look for assistant messages with usage data
          if (record.type === 'assistant' && record.message?.usage) {
            const timestampStr = record.timestamp;
            const timestamp = timestampStr ? new Date(timestampStr).getTime() : Date.now();

            // Only count tokens after the last sync
            if (timestamp > lastTimestamp) {
              const usage = record.message.usage;
              const inputTokens = usage.input_tokens || 0;
              const outputTokens = usage.output_tokens || 0;
              const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
              const cacheReadTokens = usage.cache_read_input_tokens || 0;

              // Sum all token types
              tokens += inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens;
              maxTimestamp = Math.max(maxTimestamp, timestamp);
            }
          }
        } catch (e) {
          // Skip malformed lines
        }
      }
    } catch (error) {
      // File read error - skip this file
    }

    return { tokens, lastTimestamp: maxTimestamp };
  }
}
