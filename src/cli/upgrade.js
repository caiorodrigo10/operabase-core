// src/cli/upgrade.js
import { resolve } from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { select } from '@inquirer/prompts';
import { logger } from '../utils/logger.js';

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function hashFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

export async function runUpgrade() {
  const cwd = process.cwd();
  const manifestPath = resolve(cwd, '.operabase/manifest.json');

  logger.heading('Operabase Upgrade');

  // 1. Check if manifest exists
  if (!(await fileExists(manifestPath))) {
    logger.error('No .operabase/manifest.json found.');
    logger.info('This project does not appear to be an Operabase installation.');
    logger.info('Run "npx operabase init" for a fresh install.');
    return;
  }

  // 2. Load existing manifest
  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
  const existingFiles = manifest.files || {};

  // 3. Compare: check each file in manifest
  const modified = [];
  const missing = [];
  const unchanged = [];

  for (const [filePath, expectedHash] of Object.entries(existingFiles)) {
    const fullPath = resolve(cwd, filePath);
    if (await fileExists(fullPath)) {
      const currentHash = await hashFile(fullPath);
      if (currentHash !== expectedHash) {
        modified.push(filePath);
      } else {
        unchanged.push(filePath);
      }
    } else {
      missing.push(filePath);
    }
  }

  // 4. Show summary
  console.log('');
  logger.info(`Files tracked: ${Object.keys(existingFiles).length}`);
  logger.success(`  Unchanged: ${unchanged.length}`);
  if (modified.length > 0) {
    logger.warn(`  Modified: ${modified.length}`);
    modified.forEach(f => logger.warn(`    - ${f}`));
  }
  if (missing.length > 0) {
    logger.error(`  Missing: ${missing.length}`);
    missing.forEach(f => logger.error(`    - ${f}`));
  }

  if (modified.length === 0 && missing.length === 0) {
    logger.success('Everything is up to date. No upgrade needed.');
    return;
  }

  // 5. Prompt user for action
  const action = await select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Upgrade (apply changes, preserve customizations)', value: 'upgrade' },
      { name: 'Dry Run (show what would change)', value: 'dry-run' },
      { name: 'Fresh Install (reinstall everything)', value: 'fresh' },
      { name: 'Cancel', value: 'cancel' },
    ],
  });

  switch (action) {
    case 'dry-run':
      logger.heading('Dry Run — No changes made');
      if (missing.length > 0) {
        logger.info('Would restore:');
        missing.forEach(f => logger.info(`  + ${f}`));
      }
      if (modified.length > 0) {
        logger.info('Would update (user-modified files preserved):');
        modified.forEach(f => logger.warn(`  ~ ${f}`));
      }
      break;

    case 'upgrade':
      logger.heading('Upgrading...');
      // For beta: just report what would change. Full implementation would
      // re-run generators for missing files and update manifest.
      if (missing.length > 0) {
        logger.info('Restoring missing files...');
        missing.forEach(f => logger.info(`  + ${f} (would be restored)`));
      }
      if (modified.length > 0) {
        logger.warn('User-modified files preserved (not overwritten):');
        modified.forEach(f => logger.warn(`  ~ ${f}`));
      }
      logger.success('Upgrade complete (beta mode — preview only).');
      break;

    case 'fresh':
      logger.warn('Fresh install would reinstall all Operabase files.');
      logger.info('Use "npx operabase init" for a full reinstall.');
      break;

    case 'cancel':
      logger.info('Upgrade cancelled.');
      break;
  }
}
