import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQUADS_SOURCE = resolve(__dirname, '../../../squads');

/**
 * Recursively copy a directory, skipping files that already exist.
 * @param {string} src - Source directory.
 * @param {string} dest - Destination directory.
 * @param {string[]} createdPaths - Accumulator for created relative paths.
 * @param {string} baseDir - Base directory for relative path calculation.
 */
function copyDirRecursive(src, dest, createdPaths, baseDir) {
  if (!existsSync(src)) return;

  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, createdPaths, baseDir);
    } else {
      if (existsSync(destPath)) {
        continue; // safe-write: never overwrite
      }
      mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, readFileSync(srcPath));
      createdPaths.push(relative(baseDir, destPath));
    }
  }
}

/**
 * Copy squad content (agents, tasks, workflows, templates, config, memory) to the target project.
 * @param {string} targetDir - Project root directory.
 * @param {object} options - { dev_squad: 'basic'|'complete'|'none' }
 * @returns {string[]} List of created file paths (relative to targetDir).
 */
export function copySquads(targetDir, options = {}) {
  const { dev_squad = 'basic' } = options;
  const createdPaths = [];

  if (dev_squad === 'none') {
    logger.info('  No dev squad selected — skipping squad copy.');
    return createdPaths;
  }

  const squadName = dev_squad === 'basic' ? 'dev-squad' : 'full-dev-squad';
  const srcDir = resolve(SQUADS_SOURCE, squadName);
  const destDir = resolve(targetDir, 'squads', squadName);

  if (!existsSync(srcDir)) {
    logger.warn(`  Squad source not found: ${srcDir}`);
    return createdPaths;
  }

  logger.heading('Copying squad content...');

  // Copy entire squad directory recursively
  copyDirRecursive(srcDir, destDir, createdPaths, targetDir);

  // If basic squad selected, also copy shared support agents (orchestrator, kairos, squad-creator)
  // These are already in dev-squad, so no extra work needed for basic.
  // For complete squad, copy orchestrator/kairos/squad-creator from dev-squad as support agents.
  if (dev_squad === 'complete') {
    const supportAgents = ['orchestrator.md', 'kairos.md', 'squad-creator.md'];
    const devSquadAgentsDir = resolve(SQUADS_SOURCE, 'dev-squad', 'agents');
    const fullSquadAgentsDir = resolve(destDir, 'agents');

    for (const agentFile of supportAgents) {
      const src = resolve(devSquadAgentsDir, agentFile);
      const dest = resolve(fullSquadAgentsDir, agentFile);
      if (existsSync(src) && !existsSync(dest)) {
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, readFileSync(src));
        createdPaths.push(relative(targetDir, dest));
      }
    }

    // Copy dev-squad workflows and templates (full-dev-squad doesn't have its own)
    const extraDirs = ['workflows', 'templates'];
    for (const dir of extraDirs) {
      const src = resolve(SQUADS_SOURCE, 'dev-squad', dir);
      const dest = resolve(destDir, dir);
      if (existsSync(src)) {
        copyDirRecursive(src, dest, createdPaths, targetDir);
      }
    }

    // Copy dev-squad tasks that don't exist in full-dev-squad
    const devTasksDir = resolve(SQUADS_SOURCE, 'dev-squad', 'tasks');
    const fullTasksDir = resolve(destDir, 'tasks');
    if (existsSync(devTasksDir)) {
      copyDirRecursive(devTasksDir, fullTasksDir, createdPaths, targetDir);
    }
  }

  const fileCount = createdPaths.length;
  logger.success(`  Copied ${fileCount} files for ${squadName}`);

  return createdPaths;
}
