import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CLAUDE_DIR = path.join(os.homedir(), '.claude', 'projects');

export interface SessionInfo {
  startTime: Date;
  endTime: Date;
  durationMin: number;
  totalTokens: number;
  messageCount: number;
}

export interface PersonalityTraits {
  // Time-of-day preference (0-23 hour weighted average)
  peakHour: number;
  chronotype: 'early-bird' | 'day-walker' | 'night-owl' | 'all-hours';

  // Session patterns
  avgSessionMin: number;
  sessionStyle: 'sprinter' | 'steady' | 'marathoner';

  // Frequency
  sessionsPerWeek: number;
  rhythm: 'daily-grinder' | 'regular' | 'sporadic' | 'binge-coder';

  // Day-of-week preference
  weekdayRatio: number; // 0-1, higher = more weekday coding
  schedule: 'weekday-warrior' | 'balanced' | 'weekend-hacker';

  // Intensity
  avgTokensPerSession: number;
  intensity: 'minimalist' | 'balanced' | 'deep-diver' | 'token-furnace';

  // Consistency (stddev of daily sessions)
  consistency: number; // 0-1, higher = more consistent
  pattern: 'clockwork' | 'habitual' | 'free-spirit' | 'chaotic';

  // Derived personality blurb
  blurb: string;

  // Last analyzed timestamp
  analyzedAt: number;
  sessionCount: number;
}

export function analyzeSessions(installedAt: number): PersonalityTraits | null {
  const sessions = collectSessions(installedAt);

  if (sessions.length < 3) return null; // Need at least 3 sessions for meaningful analysis

  // ─── Chronotype (time-of-day) ───
  const hourCounts = new Array(24).fill(0);
  for (const s of sessions) {
    // Weight by duration — long sessions count more
    const hour = s.startTime.getHours();
    hourCounts[hour] += s.durationMin;
  }
  const totalWeight = hourCounts.reduce((a, b) => a + b, 0);
  // Circular mean for hours (handles midnight wrap)
  let sinSum = 0, cosSum = 0;
  for (let h = 0; h < 24; h++) {
    const angle = (h / 24) * 2 * Math.PI;
    sinSum += Math.sin(angle) * hourCounts[h];
    cosSum += Math.cos(angle) * hourCounts[h];
  }
  const peakAngle = Math.atan2(sinSum / totalWeight, cosSum / totalWeight);
  const peakHour = Math.round(((peakAngle / (2 * Math.PI)) * 24 + 24) % 24);

  let chronotype: PersonalityTraits['chronotype'];
  // Check spread across time periods
  const nightTokens = sum(hourCounts.slice(22)) + sum(hourCounts.slice(0, 5));
  const morningTokens = sum(hourCounts.slice(5, 12));
  const afternoonTokens = sum(hourCounts.slice(12, 17));
  const eveningTokens = sum(hourCounts.slice(17, 22));
  const maxPeriod = Math.max(nightTokens, morningTokens, afternoonTokens, eveningTokens);
  const spreadRatio = maxPeriod / totalWeight;

  if (spreadRatio < 0.4) {
    chronotype = 'all-hours';
  } else if (peakHour >= 5 && peakHour < 11) {
    chronotype = 'early-bird';
  } else if (peakHour >= 11 && peakHour < 18) {
    chronotype = 'day-walker';
  } else {
    chronotype = 'night-owl';
  }

  // ─── Session style ───
  const durations = sessions.map(s => s.durationMin);
  const avgSessionMin = mean(durations);
  let sessionStyle: PersonalityTraits['sessionStyle'];
  if (avgSessionMin < 20) sessionStyle = 'sprinter';
  else if (avgSessionMin < 60) sessionStyle = 'steady';
  else sessionStyle = 'marathoner';

  // ─── Frequency ───
  const daySpan = Math.max(1, (Date.now() - sessions[0].startTime.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const sessionsPerWeek = sessions.length / daySpan;
  let rhythm: PersonalityTraits['rhythm'];
  if (sessionsPerWeek >= 10) rhythm = 'daily-grinder';
  else if (sessionsPerWeek >= 5) rhythm = 'regular';
  else if (sessionsPerWeek >= 2) rhythm = 'sporadic';
  else rhythm = 'binge-coder';

  // ─── Weekday vs weekend ───
  const weekdaySessions = sessions.filter(s => {
    const day = s.startTime.getDay();
    return day >= 1 && day <= 5;
  }).length;
  const weekdayRatio = weekdaySessions / sessions.length;
  let schedule: PersonalityTraits['schedule'];
  if (weekdayRatio > 0.8) schedule = 'weekday-warrior';
  else if (weekdayRatio < 0.4) schedule = 'weekend-hacker';
  else schedule = 'balanced';

  // ─── Intensity ───
  const tokenCounts = sessions.map(s => s.totalTokens);
  const avgTokensPerSession = mean(tokenCounts);
  let intensity: PersonalityTraits['intensity'];
  if (avgTokensPerSession < 50000) intensity = 'minimalist';
  else if (avgTokensPerSession < 200000) intensity = 'balanced';
  else if (avgTokensPerSession < 500000) intensity = 'deep-diver';
  else intensity = 'token-furnace';

  // ─── Consistency ───
  // Group sessions by day, measure how regular the pattern is
  const dayCounts = new Map<string, number>();
  for (const s of sessions) {
    const key = s.startTime.toISOString().slice(0, 10);
    dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
  }
  const dailyCounts = Array.from(dayCounts.values());
  const stdDev = standardDeviation(dailyCounts);
  const meanDaily = mean(dailyCounts);
  const cv = meanDaily > 0 ? stdDev / meanDaily : 1; // coefficient of variation
  const consistency = Math.max(0, Math.min(1, 1 - cv));

  let pattern: PersonalityTraits['pattern'];
  if (consistency > 0.7) pattern = 'clockwork';
  else if (consistency > 0.4) pattern = 'habitual';
  else if (consistency > 0.2) pattern = 'free-spirit';
  else pattern = 'chaotic';

  // ─── Personality blurb ───
  const blurb = generateBlurb({
    chronotype, sessionStyle, rhythm, schedule, intensity, pattern
  });

  return {
    peakHour,
    chronotype,
    avgSessionMin: Math.round(avgSessionMin),
    sessionStyle,
    sessionsPerWeek: Math.round(sessionsPerWeek * 10) / 10,
    rhythm,
    weekdayRatio: Math.round(weekdayRatio * 100) / 100,
    schedule,
    avgTokensPerSession: Math.round(avgTokensPerSession),
    intensity,
    consistency: Math.round(consistency * 100) / 100,
    pattern,
    blurb,
    analyzedAt: Date.now(),
    sessionCount: sessions.length,
  };
}

function collectSessions(installedAt: number): SessionInfo[] {
  const sessions: SessionInfo[] = [];

  try {
    if (!fs.existsSync(CLAUDE_DIR)) return sessions;

    const projectDirs = fs.readdirSync(CLAUDE_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => path.join(CLAUDE_DIR, d.name));

    for (const dir of projectDirs) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl'));

      for (const file of files) {
        const session = parseSessionFile(path.join(dir, file), installedAt);
        if (session) sessions.push(session);
      }
    }
  } catch (e) {
    // Silent fail
  }

  sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  return sessions;
}

function parseSessionFile(filePath: string, installedAt: number): SessionInfo | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());

    let firstTime: Date | null = null;
    let lastTime: Date | null = null;
    let totalTokens = 0;
    let messageCount = 0;

    for (const line of lines) {
      try {
        const record = JSON.parse(line);
        if (!record.timestamp) continue;

        const ts = new Date(record.timestamp);
        if (ts.getTime() < installedAt) continue;

        if (!firstTime || ts < firstTime) firstTime = ts;
        if (!lastTime || ts > lastTime) lastTime = ts;

        if (record.type === 'assistant' && record.message?.usage) {
          const u = record.message.usage;
          totalTokens += (u.input_tokens || 0) + (u.output_tokens || 0)
            + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
          messageCount++;
        }
      } catch (e) {}
    }

    if (!firstTime || !lastTime || messageCount === 0) return null;

    const durationMin = Math.max(1, (lastTime.getTime() - firstTime.getTime()) / 60000);

    return { startTime: firstTime, endTime: lastTime, durationMin, totalTokens, messageCount };
  } catch (e) {
    return null;
  }
}

function generateBlurb(traits: {
  chronotype: string;
  sessionStyle: string;
  rhythm: string;
  schedule: string;
  intensity: string;
  pattern: string;
}): string {
  const time = {
    'early-bird': 'rises with the sun to code',
    'day-walker': 'codes during daylight hours',
    'night-owl': 'comes alive after dark',
    'all-hours': 'codes at all hours of the day',
  }[traits.chronotype];

  const style = {
    'sprinter': 'in quick, focused bursts',
    'steady': 'in steady, measured sessions',
    'marathoner': 'in long, deep work marathons',
  }[traits.sessionStyle];

  const freq = {
    'daily-grinder': 'Every day without fail,',
    'regular': 'With a reliable rhythm,',
    'sporadic': 'When inspiration strikes,',
    'binge-coder': 'In intense bursts of activity,',
  }[traits.rhythm];

  const work = {
    'minimalist': 'with surgical precision',
    'balanced': 'with a balanced approach',
    'deep-diver': 'diving deep into complex problems',
    'token-furnace': 'consuming tokens like wildfire',
  }[traits.intensity];

  return `${freq} ${time} ${style}, ${work}.`;
}

// ─── Math helpers ───
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function mean(arr: number[]): number {
  return arr.length ? sum(arr) / arr.length : 0;
}

function standardDeviation(arr: number[]): number {
  const m = mean(arr);
  const sqDiffs = arr.map(v => (v - m) ** 2);
  return Math.sqrt(mean(sqDiffs));
}
