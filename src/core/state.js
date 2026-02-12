// State module for .operabase/state.json
// The Orchestrator skill reads/writes pipeline state through this module.
// Atomic writes: write to .tmp first, then rename (prevents corruption).

import { readFile, writeFile, rename, unlink, access, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const STATE_DIR = '.operabase';
const STATE_FILE = '.operabase/state.json';

/**
 * Ensure .operabase/ directory exists.
 */
async function ensureDir(cwd) {
  const dir = resolve(cwd, STATE_DIR);
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Load pipeline state from .operabase/state.json.
 * Returns null if file doesn't exist.
 */
export async function load(cwd) {
  const filePath = resolve(cwd, STATE_FILE);
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw new Error(`Failed to load state: ${err.message}`);
  }
}

/**
 * Save pipeline state atomically (write .tmp, then rename).
 * Always updates `updated_at`.
 */
export async function save(cwd, state) {
  await ensureDir(cwd);
  const filePath = resolve(cwd, STATE_FILE);
  const tmpPath = filePath + '.tmp';

  state.updated_at = new Date().toISOString();

  const data = JSON.stringify(state, null, 2) + '\n';
  await writeFile(tmpPath, data, 'utf-8');
  await rename(tmpPath, filePath);
}

/**
 * Delete state.json (pipeline completed, clean up).
 */
export async function clear(cwd) {
  const filePath = resolve(cwd, STATE_FILE);
  try {
    await unlink(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') return; // already gone
    throw new Error(`Failed to clear state: ${err.message}`);
  }
}

/**
 * Create a new pipeline state with phases array, each phase "pending".
 *
 * @param {string} cwd - Working directory
 * @param {{ pipelineId: string, phases: string[] }} opts
 *   phases is an array of phase names (e.g. ["analysis", "implementation", "testing"])
 */
export async function createPipeline(cwd, { pipelineId, phases }) {
  const now = new Date().toISOString();

  const state = {
    pipeline_id: pipelineId,
    current_phase: phases[0] || null,
    phases: phases.map((name) => ({
      name,
      status: 'pending',
      agent: null,
      started_at: null,
      completed_at: null,
      result: null,
    })),
    started_at: now,
    updated_at: now,
    paused: false,
    error: null,
  };

  await save(cwd, state);
  return state;
}

/**
 * Update a specific phase by name.
 *
 * @param {string} cwd - Working directory
 * @param {string} phaseName - Name of the phase to update
 * @param {object} updates - Fields to merge (status, agent, result, etc.)
 */
export async function updatePhase(cwd, phaseName, updates) {
  const state = await load(cwd);
  if (!state) {
    throw new Error('No active pipeline. Cannot update phase.');
  }

  const phase = state.phases.find((p) => p.name === phaseName);
  if (!phase) {
    throw new Error(`Phase "${phaseName}" not found in pipeline.`);
  }

  // Auto-set timestamps based on status transitions
  if (updates.status === 'running' && !phase.started_at) {
    phase.started_at = new Date().toISOString();
  }
  if (updates.status === 'completed' || updates.status === 'failed') {
    phase.completed_at = new Date().toISOString();
  }

  Object.assign(phase, updates);

  // Advance current_phase to the next pending/running phase
  const nextPhase = state.phases.find(
    (p) => p.status === 'running' || p.status === 'pending'
  );
  state.current_phase = nextPhase ? nextPhase.name : null;

  await save(cwd, state);
  return state;
}

/**
 * Return a summary of the current pipeline status.
 *
 * @param {string} cwd - Working directory
 * @returns {{ id, currentPhase, progress, paused, error } | null}
 */
export async function getPipelineStatus(cwd) {
  const state = await load(cwd);
  if (!state) return null;

  const total = state.phases.length;
  const completed = state.phases.filter(
    (p) => p.status === 'completed' || p.status === 'skipped'
  ).length;

  return {
    id: state.pipeline_id,
    currentPhase: state.current_phase,
    progress: `${completed}/${total}`,
    paused: state.paused,
    error: state.error,
  };
}
