import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '../../..');

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively copy a directory, skipping files that already exist.
 * @param {string} srcDir - Source directory.
 * @param {string} destDir - Destination directory.
 * @param {string[]} createdPaths - Accumulator for created relative paths.
 * @param {string} baseRelative - Base relative path for logging.
 */
async function copyDirRecursive(srcDir, destDir, createdPaths, baseRelative) {
  if (!(await exists(srcDir))) {
    return;
  }

  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    const relativePath = join(baseRelative, entry.name);

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyDirRecursive(srcPath, destPath, createdPaths, relativePath);
    } else {
      // Skip if file already exists (safe-write)
      if (await exists(destPath)) {
        continue;
      }

      await mkdir(dirname(destPath), { recursive: true });
      const content = await readFile(srcPath);
      await writeFile(destPath, content);
      createdPaths.push(relativePath);
      logger.success(`  Created: ${relativePath}`);
    }
  }
}

/**
 * Copy a single squad's structure to the target directory.
 * @param {string} squadName - Squad name (e.g., 'dev-squad').
 * @param {string} sourceRoot - Package root directory.
 * @param {string} targetRoot - Target project root.
 * @param {string[]} createdPaths - Accumulator for created paths.
 */
async function copySquadStructure(squadName, sourceRoot, targetRoot, createdPaths) {
  const squadSourceDir = join(sourceRoot, 'squads', squadName);
  const squadTargetDir = join(targetRoot, 'squads', squadName);

  if (!(await exists(squadSourceDir))) {
    logger.warn(`Squad "${squadName}" not found in package source`);
    return;
  }

  const subdirs = ['agents', 'tasks', 'workflows', 'config', 'templates', 'memory'];

  // Copy subdirectories
  for (const subdir of subdirs) {
    const srcPath = join(squadSourceDir, subdir);
    const destPath = join(squadTargetDir, subdir);
    const baseRelative = `squads/${squadName}/${subdir}`;

    await copyDirRecursive(srcPath, destPath, createdPaths, baseRelative);
  }

  // Copy root README.md
  const readmeSrc = join(squadSourceDir, 'README.md');
  const readmeDest = join(squadTargetDir, 'README.md');
  const readmeRelative = `squads/${squadName}/README.md`;

  if (await exists(readmeSrc)) {
    if (!(await exists(readmeDest))) {
      await mkdir(squadTargetDir, { recursive: true });
      const content = await readFile(readmeSrc);
      await writeFile(readmeDest, content);
      createdPaths.push(readmeRelative);
      logger.success(`  Created: ${readmeRelative}`);
    }
  }
}

/**
 * Copy squad content (agents, tasks, workflows, templates, config, memory) to the target project.
 * @param {string} targetDir - Project root directory.
 * @param {object} options - { dev_squad: 'basic'|'complete'|'none', extra_squads: string[] }
 * @returns {Promise<string[]>} List of created file paths (relative to targetDir).
 */
export async function copySquads(targetDir, options = {}) {
  const { dev_squad = 'none', extra_squads = [] } = options;
  const createdPaths = [];

  logger.heading('Copying squad files...');

  // Map dev_squad option to squad names
  const devSquadMap = {
    basic: 'dev-squad',
    complete: 'full-dev-squad',
    none: null
  };

  const selectedDevSquad = devSquadMap[dev_squad];

  if (selectedDevSquad) {
    if (dev_squad === 'complete') {
      // Copy both full-dev-squad and dev-squad
      // full-dev-squad has the 9 specialized agents
      await copySquadStructure('full-dev-squad', PACKAGE_ROOT, targetDir, createdPaths);
      // dev-squad has support agents (orchestrator, kairos, squad-creator) + extra tasks/workflows
      await copySquadStructure('dev-squad', PACKAGE_ROOT, targetDir, createdPaths);
    } else if (dev_squad === 'basic') {
      // Just copy dev-squad
      await copySquadStructure('dev-squad', PACKAGE_ROOT, targetDir, createdPaths);
    }
  }

  // Handle extra squads
  for (const squadName of extra_squads) {
    const squadSourceDir = join(PACKAGE_ROOT, 'squads', squadName);
    if (await exists(squadSourceDir)) {
      await copySquadStructure(squadName, PACKAGE_ROOT, targetDir, createdPaths);
    } else {
      logger.warn(`Squad "${squadName}" is not yet available. It will be installable in a future release.`);
    }
  }

  if (createdPaths.length === 0) {
    logger.info('  No new squad files to copy (all files already exist or no squads selected)');
  }

  return createdPaths;
}
