import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
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

/**
 * Compute SHA-256 hash of a file.
 * @param {string} filePath - Absolute path to file.
 * @returns {Promise<string>} Hex-encoded SHA-256 hash.
 */
async function hashFile(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Generate .operabase/manifest.json with SHA-256 hashes of all created files.
 * @param {string} targetDir - Project root.
 * @param {string[]} createdPaths - Relative paths of files created during init.
 * @returns {Promise<string>} Relative path of the manifest file.
 */
export async function generateManifest(targetDir, createdPaths) {
  logger.heading('Generating manifest...');

  const files = {};

  for (const relPath of createdPaths) {
    const absPath = resolve(targetDir, relPath);
    if (await exists(absPath)) {
      try {
        files[relPath] = await hashFile(absPath);
      } catch {
        // Skip directories or unreadable files
      }
    }
  }

  const manifest = {
    version: '0.1.0-beta',
    created_at: new Date().toISOString(),
    files,
  };

  const manifestPath = resolve(targetDir, '.operabase/manifest.json');
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

  logger.success(`Created: .operabase/manifest.json (${Object.keys(files).length} files tracked)`);
  return '.operabase/manifest.json';
}
