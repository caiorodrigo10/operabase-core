import { resolve } from 'node:path';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { access } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { logger } from '../utils/logger.js';
import { validateConfig } from '../core/config-validator.js';
import { parseYamlFile } from '../utils/yaml.js';

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

/**
 * Run Operabase doctor diagnostics.
 */
export async function runDoctor() {
  const cwd = process.cwd();
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;
  const results = [];

  function pass(msg) { results.push({ status: 'pass', msg }); passCount++; }
  function fail(msg, fix) { results.push({ status: 'fail', msg, fix }); failCount++; }
  function warn(msg, fix) { results.push({ status: 'warn', msg, fix }); warnCount++; }

  logger.heading('Operabase Doctor');
  console.log('');

  // 1. Check operabase.yaml exists and is valid
  const yamlPath = resolve(cwd, 'operabase.yaml');
  if (await fileExists(yamlPath)) {
    const validation = validateConfig(yamlPath);
    if (validation.valid) {
      pass('operabase.yaml exists and is valid');
    } else {
      fail('operabase.yaml has validation errors', `Fix errors: ${validation.errors?.map(e => e.message).join(', ')}`);
    }
  } else {
    fail('operabase.yaml not found', 'Run "npx operabase init" to create one');
  }

  // 2. Check Node.js version >= 18
  try {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0], 10);
    if (major >= 18) {
      pass(`Node.js ${nodeVersion} (>= 18 required)`);
    } else {
      fail(`Node.js ${nodeVersion} is too old`, 'Upgrade to Node.js 18 or later');
    }
  } catch {
    fail('Could not determine Node.js version', 'Ensure Node.js is installed');
  }

  // 3. Check Git installed and repo valid
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'pipe' });
    pass('Git repository detected');
  } catch {
    warn('Not inside a Git repository', 'Run "git init" to initialize');
  }

  // 4. Check constitution exists
  if (await fileExists(resolve(cwd, 'constitution.md'))) {
    pass('constitution.md exists');
  } else {
    warn('constitution.md not found', 'Constitution defines framework principles');
  }

  // 5. Check .claude/skills/ directory exists
  if (await fileExists(resolve(cwd, '.claude/skills'))) {
    pass('.claude/skills/ directory exists');
  } else {
    fail('.claude/skills/ not found', 'Skills directory is required for agent definitions');
  }

  // 6. Check squads declared in operabase.yaml exist on disk
  try {
    const config = parseYamlFile(yamlPath);
    const squadsConfig = config?.squads || {};
    const declaredSquads = [
      ...(squadsConfig.core || []),
      ...(squadsConfig.extras || []),
    ];
    for (const sq of declaredSquads) {
      const squadName = typeof sq === 'string' ? sq : sq.name;
      if (squadName && await fileExists(resolve(cwd, `squads/${squadName}`))) {
        pass(`Squad "${squadName}" directory exists`);
      } else if (squadName) {
        fail(`Squad "${squadName}" declared but directory missing`, `Create squads/${squadName}/`);
      }
    }
  } catch {
    // operabase.yaml might not be loadable -- already reported above
  }

  // 7. Check .operabase/manifest.json exists
  if (await fileExists(resolve(cwd, '.operabase/manifest.json'))) {
    pass('.operabase/manifest.json exists');
  } else {
    warn('.operabase/manifest.json not found', 'Run "npx operabase init" to generate manifest');
  }

  // 8. Check .claude/settings.json has common permissions
  const settingsPath = resolve(process.env.HOME || '~', '.claude/settings.json');
  if (await fileExists(settingsPath)) {
    pass('.claude/settings.json exists');
  } else {
    warn('.claude/settings.json not found', 'Claude Code settings may need configuration');
  }

  // 9. Check package.json exists
  if (await fileExists(resolve(cwd, 'package.json'))) {
    pass('package.json exists');
  } else {
    warn('package.json not found', 'Run "npm init" to create one');
  }

  // 10. Check .operabase/ directory exists
  if (await fileExists(resolve(cwd, '.operabase'))) {
    pass('.operabase/ directory exists');
  } else {
    warn('.operabase/ not found', 'Run "npx operabase init" to set up project');
  }

  // 11. Check permissions content in ~/.claude/settings.json
  try {
    const permSettingsPath = resolve(process.env.HOME || '~', '.claude/settings.json');
    if (existsSync(permSettingsPath)) {
      const settingsContent = JSON.parse(readFileSync(permSettingsPath, 'utf-8'));
      const allowList = settingsContent?.permissions?.allow || [];
      const requiredPerms = ['Bash(*)', 'Write(*)', 'Edit(*)', 'Read(*)'];
      const missingPerms = requiredPerms.filter(p => !allowList.some(a => a === p));
      if (missingPerms.length === 0) {
        pass('Permissions: Bash(*), Write(*), Edit(*), Read(*) all present');
      } else {
        warn(
          `Permissions missing: ${missingPerms.join(', ')}`,
          `Add to ~/.claude/settings.json → permissions.allow: ${missingPerms.map(p => `"${p}"`).join(', ')}`
        );
      }
    }
    // If settings.json doesn't exist, already reported in check 8
  } catch {
    warn('Could not parse ~/.claude/settings.json', 'Verify the file contains valid JSON');
  }

  // 12. Check SKILL.md references -- verify referenced agent definition files exist
  try {
    const skillsBasePath = resolve(cwd, '.claude/skills');
    if (existsSync(skillsBasePath)) {
      const skillDirs = readdirSync(skillsBasePath, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      for (const skillName of skillDirs) {
        const skillMdPath = resolve(skillsBasePath, skillName, 'SKILL.md');
        if (!existsSync(skillMdPath)) continue;

        const skillContent = readFileSync(skillMdPath, 'utf-8');
        // Look for references like: squads/{squad}/agents/{agent}.md
        const refMatch = skillContent.match(/squads\/([^/]+)\/agents\/([^\s`]+\.md)/);
        if (refMatch) {
          const refPath = resolve(cwd, `squads/${refMatch[1]}/agents/${refMatch[2]}`);
          if (existsSync(refPath)) {
            pass(`Skill "${skillName}" → agent definition exists`);
          } else {
            fail(
              `Skill "${skillName}" references missing file: squads/${refMatch[1]}/agents/${refMatch[2]}`,
              `Create the agent definition or update .claude/skills/${skillName}/SKILL.md`
            );
          }
        }
      }
    }
  } catch {
    warn('Could not verify SKILL.md references', 'Check .claude/skills/ directory permissions');
  }

  // 13. Check manifest hashes -- verify at least one file's SHA-256 hash matches
  try {
    const manifestPath = resolve(cwd, '.operabase/manifest.json');
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      const files = manifest.files || {};
      const fileEntries = Object.entries(files);

      if (fileEntries.length === 0) {
        warn('Manifest contains no file entries', 'Regenerate manifest with "npx operabase init"');
      } else {
        let verified = false;
        let checked = 0;
        let mismatched = 0;

        for (const [filePath, meta] of fileEntries) {
          const fullPath = resolve(cwd, filePath);
          if (!existsSync(fullPath)) continue;
          if (!meta.sha256) continue;

          checked++;
          const content = readFileSync(fullPath);
          const hash = createHash('sha256').update(content).digest('hex');
          if (hash === meta.sha256) {
            verified = true;
            break;
          } else {
            mismatched++;
          }
        }

        if (verified) {
          pass('Manifest hash verification passed (at least one file matches)');
        } else if (checked === 0) {
          warn('No manifest files could be checked (files missing or no hashes)', 'Regenerate manifest');
        } else {
          warn(
            `Manifest hash mismatch (${mismatched}/${checked} checked files differ)`,
            'Files may have been modified. Regenerate manifest with "npx operabase init"'
          );
        }
      }
    }
    // If manifest.json doesn't exist, already reported in check 7
  } catch {
    warn('Could not verify manifest hashes', 'Check .operabase/manifest.json format');
  }

  // Print results
  console.log('');
  for (const r of results) {
    if (r.status === 'pass') {
      logger.success(`  ${r.msg}`);
    } else if (r.status === 'fail') {
      logger.error(`  ${r.msg}`);
      if (r.fix) logger.info(`     Fix: ${r.fix}`);
    } else {
      logger.warn(`  ${r.msg}`);
      if (r.fix) logger.info(`     Fix: ${r.fix}`);
    }
  }

  // Summary
  console.log('');
  logger.heading('Summary');
  logger.success(`  ${passCount} passed`);
  if (warnCount > 0) logger.warn(`  ${warnCount} warnings`);
  if (failCount > 0) logger.error(`  ${failCount} failed`);

  if (failCount > 0) {
    process.exit(1);
  }
}
