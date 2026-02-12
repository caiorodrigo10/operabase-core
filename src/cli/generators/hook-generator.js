import { readFile, writeFile, mkdir, access, chmod } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '../../templates');

/**
 * Check if a file exists.
 * @param {string} p - Path to check.
 * @returns {Promise<boolean>}
 */
async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a hook template, falling back to inline content.
 */
async function readHookTemplate(templateName, fallback) {
  try {
    return await readFile(resolve(TEMPLATES_DIR, 'hooks', templateName), 'utf-8');
  } catch {
    return fallback;
  }
}

/**
 * Generate Claude Code hook scripts.
 * @param {string} targetDir - Project root.
 * @returns {Promise<string[]>} List of created file paths (relative).
 */
export async function generateHooks(targetDir) {
  const hooksDir = resolve(targetDir, '.claude/hooks');
  const createdPaths = [];

  logger.heading('Creating hooks...');

  await mkdir(hooksDir, { recursive: true });

  // Pre-commit hook (template has exit code handling)
  const preCommitPath = resolve(hooksDir, 'pre-commit.sh');
  if (await exists(preCommitPath)) {
    logger.warn('Skipped (already exists): .claude/hooks/pre-commit.sh');
  } else {
    const content = await readHookTemplate('pre-commit.sh', '#!/bin/bash\nnpx operabase gates --stage pre_commit\n');
    await writeFile(preCommitPath, content, 'utf-8');
    await chmod(preCommitPath, 0o755);
    createdPaths.push('.claude/hooks/pre-commit.sh');
    logger.success('Created: .claude/hooks/pre-commit.sh');
  }

  // Pre-push hook (template has exit code handling)
  const prePushPath = resolve(hooksDir, 'pre-push.sh');
  if (await exists(prePushPath)) {
    logger.warn('Skipped (already exists): .claude/hooks/pre-push.sh');
  } else {
    const content = await readHookTemplate('pre-push.sh', '#!/bin/bash\nnpx operabase gates --stage pre_push\n');
    await writeFile(prePushPath, content, 'utf-8');
    await chmod(prePushPath, 0o755);
    createdPaths.push('.claude/hooks/pre-push.sh');
    logger.success('Created: .claude/hooks/pre-push.sh');
  }

  return createdPaths;
}
