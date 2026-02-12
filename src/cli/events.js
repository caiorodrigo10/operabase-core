// src/cli/events.js
import { resolve } from 'node:path';
import { readFile, writeFile, appendFile, access, mkdir } from 'node:fs/promises';
import { logger } from '../utils/logger.js';

const EVENTS_DIR = '.operabase/cache';
const EVENTS_FILE = '.operabase/cache/events.jsonl';
const MAX_EVENTS = 1000;

async function ensureDir(cwd) {
  const dir = resolve(cwd, EVENTS_DIR);
  try { await access(dir); } catch { await mkdir(dir, { recursive: true }); }
}

/**
 * Emit an event to the events log.
 * @param {string} cwd - Project root directory.
 * @param {{ event: string, agent?: string, phase?: string, data?: object }} event - Event data.
 */
export async function emitEvent(cwd, event) {
  await ensureDir(cwd);
  const entry = {
    event: event.event,
    timestamp: new Date().toISOString(),
    agent: event.agent || null,
    phase: event.phase || null,
    data: event.data || {},
  };

  const filePath = resolve(cwd, EVENTS_FILE);
  await appendFile(filePath, JSON.stringify(entry) + '\n', 'utf-8');

  // Rotate: keep only last MAX_EVENTS
  await rotateEvents(filePath);
}

/**
 * Rotate events file to keep only last MAX_EVENTS entries.
 * @param {string} filePath - Absolute path to events file.
 */
async function rotateEvents(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    if (lines.length > MAX_EVENTS) {
      const trimmed = lines.slice(lines.length - MAX_EVENTS);
      await writeFile(filePath, trimmed.join('\n') + '\n', 'utf-8');
    }
  } catch {
    // File might not exist yet — that's fine
  }
}

/**
 * Read and display recent events.
 * @param {number} [count=20] - Number of recent events to show.
 */
export async function runEvents(count) {
  const cwd = process.cwd();
  const filePath = resolve(cwd, EVENTS_FILE);
  const limit = count ? parseInt(count, 10) : 20;

  logger.heading('Recent Events');

  try {
    await access(filePath);
  } catch {
    logger.info('No events recorded yet.');
    logger.info('Events are emitted during quality gate runs and pipeline operations.');
    return;
  }

  const content = await readFile(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  if (lines.length === 0) {
    logger.info('No events recorded yet.');
    return;
  }

  const recent = lines.slice(-limit);

  logger.info(`Showing last ${recent.length} of ${lines.length} events:`);
  console.log('');

  for (const line of recent) {
    try {
      const evt = JSON.parse(line);
      const time = evt.timestamp ? new Date(evt.timestamp).toLocaleString() : '?';
      const agent = evt.agent ? `[${evt.agent}]` : '';
      const phase = evt.phase ? `(${evt.phase})` : '';
      console.log(`  ${time} ${evt.event} ${agent} ${phase}`);
    } catch {
      // Skip malformed lines
    }
  }

  console.log('');
  logger.info(`Total events: ${lines.length}`);
}
