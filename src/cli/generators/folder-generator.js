import { readFile, writeFile, mkdir, access, chmod } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '../../templates');

/**
 * Read the folder-structure.json template.
 * @returns {Promise<object>} Parsed folder structure definition.
 */
async function loadFolderStructure() {
  const raw = await readFile(resolve(TEMPLATES_DIR, 'folder-structure.json'), 'utf-8');
  return JSON.parse(raw);
}

/**
 * Check if a file or directory already exists.
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
 * Create a directory if it does not exist.
 * @param {string} dirPath - Absolute path.
 * @returns {Promise<boolean>} true if created, false if skipped.
 */
async function ensureDir(dirPath) {
  if (await exists(dirPath)) {
    return false;
  }
  await mkdir(dirPath, { recursive: true });
  return true;
}

/**
 * Write a file only if it does not already exist (T2.2.5 rule).
 * @param {string} filePath - Absolute path.
 * @param {string} content - File content.
 * @returns {Promise<boolean>} true if created, false if skipped.
 */
async function safeWriteFile(filePath, content) {
  if (await exists(filePath)) {
    logger.warn(`Skipped (already exists): ${filePath}`);
    return false;
  }
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf-8');
  return true;
}

/**
 * Generate the full folder structure in the target directory.
 * @param {string} targetDir - The project root where Operabase is being initialized.
 * @param {object} answers - Wizard answers (needs multi_tenant, obsidian, etc.).
 * @returns {Promise<string[]>} List of created file/directory paths (relative).
 */
export async function generateFolders(targetDir, answers) {
  const structure = await loadFolderStructure();
  const createdPaths = [];

  logger.heading('Creating folder structure...');

  // 1. Create base directories
  for (const dir of structure.directories) {
    const fullPath = resolve(targetDir, dir.path);
    const created = await ensureDir(fullPath);
    if (created) {
      createdPaths.push(dir.path);
      logger.success(`Created: ${dir.path}/`);
    } else {
      logger.warn(`Skipped (exists): ${dir.path}/`);
    }

    // Create files listed inside directory entries
    if (dir.files) {
      for (const file of dir.files) {
        const filePath = resolve(fullPath, file.name);
        let content = '';
        if (file.template) {
          const templatePath = resolve(TEMPLATES_DIR, file.template);
          if (await exists(templatePath)) {
            content = await readFile(templatePath, 'utf-8');
          }
        }
        const fileCreated = await safeWriteFile(filePath, content);
        if (fileCreated) {
          const relPath = `${dir.path}/${file.name}`;
          createdPaths.push(relPath);
          logger.success(`Created: ${relPath}`);
        }
      }
    }

    // Create .gitignore inside directories that specify one
    if (dir.gitignore) {
      const gitignorePath = resolve(fullPath, '.gitignore');
      const lines = [];
      if (dir.gitignore.comment) {
        lines.push(`# ${dir.gitignore.comment}`);
      }
      for (const entry of dir.gitignore.entries) {
        lines.push(entry);
      }
      lines.push('');
      const gitCreated = await safeWriteFile(gitignorePath, lines.join('\n'));
      if (gitCreated) {
        const relPath = `${dir.path}/.gitignore`;
        createdPaths.push(relPath);
        logger.success(`Created: ${relPath}`);
      }
    }
  }

  // 2. Handle conditional directories
  for (const cond of structure.conditional) {
    const conditionMet = answers[cond.condition] === true;
    if (conditionMet) {
      for (const dir of cond.directories) {
        const fullPath = resolve(targetDir, dir.path);
        const created = await ensureDir(fullPath);
        if (created) {
          createdPaths.push(dir.path);
          logger.success(`Created: ${dir.path}/ (conditional: ${cond.condition})`);
        }
      }
    }
  }

  // 3. Create root files (constitution.md — operabase.yaml handled by config-generator)
  for (const rootFile of structure.root_files) {
    if (rootFile.name === 'operabase.yaml') {
      // Handled by config-generator — skip here
      continue;
    }
    const filePath = resolve(targetDir, rootFile.name);
    let content = '';
    if (rootFile.source) {
      // Copy from operabaseos root (e.g. constitution.md)
      const sourcePath = resolve(__dirname, '../../../', rootFile.source);
      if (await exists(sourcePath)) {
        content = await readFile(sourcePath, 'utf-8');
      }
    } else if (rootFile.template) {
      const templatePath = resolve(TEMPLATES_DIR, rootFile.template);
      if (await exists(templatePath)) {
        content = await readFile(templatePath, 'utf-8');
      }
    }
    const created = await safeWriteFile(filePath, content);
    if (created) {
      createdPaths.push(rootFile.name);
      logger.success(`Created: ${rootFile.name}`);
    }
  }

  // 4. Create .operabase files (manifest.json created by manifest-generator, .gitignore here)
  for (const opFile of structure.operabase_files) {
    if (opFile.path === '.operabase/manifest.json') {
      // Handled by manifest-generator — skip here
      continue;
    }
    const filePath = resolve(targetDir, opFile.path);
    let content = '';
    if (opFile.content) {
      content = opFile.content;
    } else if (opFile.default_content) {
      content = JSON.stringify(opFile.default_content, null, 2) + '\n';
    }
    const created = await safeWriteFile(filePath, content);
    if (created) {
      createdPaths.push(opFile.path);
      logger.success(`Created: ${opFile.path}`);
    }
  }

  return createdPaths;
}
