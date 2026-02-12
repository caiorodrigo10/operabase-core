import { writeFile, mkdir, access, chmod } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { logger } from '../../utils/logger.js';

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

const PRE_COMMIT_HOOK = `#!/bin/bash
# Operabase pre-commit hook
# Runs quality gates before each commit

npx operabase gates --stage pre_commit
`;

const PRE_PUSH_HOOK = `#!/bin/bash
# Operabase pre-push hook
# Runs quality gates before each push

npx operabase gates --stage pre_push
`;

/**
 * Generate Claude Code hook scripts.
 * @param {string} targetDir - Project root.
 * @returns {Promise<string[]>} List of created file paths (relative).
 */
export async function generateHooks(targetDir) {
  const hooksDir = resolve(targetDir, '.claude/hooks');
  const createdPaths = [];

  logger.heading('Creating hooks...');

  // Ensure hooks directory exists
  await mkdir(hooksDir, { recursive: true });

  // Pre-commit hook
  const preCommitPath = resolve(hooksDir, 'pre-commit.sh');
  if (await exists(preCommitPath)) {
    logger.warn('Skipped (already exists): .claude/hooks/pre-commit.sh');
  } else {
    await writeFile(preCommitPath, PRE_COMMIT_HOOK, 'utf-8');
    await chmod(preCommitPath, 0o755);
    createdPaths.push('.claude/hooks/pre-commit.sh');
    logger.success('Created: .claude/hooks/pre-commit.sh');
  }

  // Pre-push hook
  const prePushPath = resolve(hooksDir, 'pre-push.sh');
  if (await exists(prePushPath)) {
    logger.warn('Skipped (already exists): .claude/hooks/pre-push.sh');
  } else {
    await writeFile(prePushPath, PRE_PUSH_HOOK, 'utf-8');
    await chmod(prePushPath, 0o755);
    createdPaths.push('.claude/hooks/pre-push.sh');
    logger.success('Created: .claude/hooks/pre-push.sh');
  }

  return createdPaths;
}
