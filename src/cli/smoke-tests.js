import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { logger } from '../utils/logger.js';
import { validateConfig } from '../core/config-validator.js';

/**
 * Run smoke tests to verify Operabase installation.
 */
export async function runSmokeTests() {
  const cwd = process.cwd();
  let passed = 0;
  let failed = 0;

  logger.heading('Operabase Smoke Tests');
  console.log('');

  // Test 1: operabase.yaml exists and is valid
  const configPath = resolve(cwd, 'operabase.yaml');
  if (existsSync(configPath)) {
    try {
      const result = validateConfig(configPath);
      if (result.valid) {
        logger.success('  [PASS] operabase.yaml is valid');
        passed++;
      } else {
        logger.error(`  [FAIL] operabase.yaml has ${result.errors.length} error(s)`);
        failed++;
      }
    } catch (e) {
      logger.error(`  [FAIL] operabase.yaml: ${e.message}`);
      failed++;
    }
  } else {
    logger.error('  [FAIL] operabase.yaml not found');
    failed++;
  }

  // Test 2: constitution.md exists
  const constitutionPath = resolve(cwd, 'constitution.md');
  if (existsSync(constitutionPath)) {
    const content = readFileSync(constitutionPath, 'utf-8');
    if (content.includes('Article I') && content.includes('Skills-First')) {
      logger.success('  [PASS] constitution.md exists and has required articles');
      passed++;
    } else {
      logger.error('  [FAIL] constitution.md missing required articles');
      failed++;
    }
  } else {
    logger.error('  [FAIL] constitution.md not found');
    failed++;
  }

  // Test 3: .claude/skills/ directory has SKILL.md files
  const skillsDir = resolve(cwd, '.claude', 'skills');
  if (existsSync(skillsDir)) {
    const { readdirSync } = await import('node:fs');
    const skills = readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .filter(d => existsSync(resolve(skillsDir, d.name, 'SKILL.md')));
    if (skills.length > 0) {
      logger.success(`  [PASS] ${skills.length} skill(s) found in .claude/skills/`);
      passed++;
    } else {
      logger.error('  [FAIL] no SKILL.md files found in .claude/skills/');
      failed++;
    }
  } else {
    logger.error('  [FAIL] .claude/skills/ directory not found');
    failed++;
  }

  // Test 4: At least one squad directory exists
  const squadsDir = resolve(cwd, 'squads');
  if (existsSync(squadsDir)) {
    const { readdirSync } = await import('node:fs');
    const squads = readdirSync(squadsDir, { withFileTypes: true })
      .filter(d => d.isDirectory());
    if (squads.length > 0) {
      logger.success(`  [PASS] ${squads.length} squad(s) found`);
      passed++;
    } else {
      logger.error('  [FAIL] no squads found in squads/');
      failed++;
    }
  } else {
    logger.error('  [FAIL] squads/ directory not found');
    failed++;
  }

  // Test 5: Squad agents have matching SKILL.md
  let agentSkillMismatches = 0;
  if (existsSync(squadsDir) && existsSync(skillsDir)) {
    const { readdirSync } = await import('node:fs');
    const squads = readdirSync(squadsDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const squad of squads) {
      const agentsDir = resolve(squadsDir, squad.name, 'agents');
      if (existsSync(agentsDir)) {
        const agents = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
        for (const agent of agents) {
          const agentId = agent.replace('.md', '');
          const skillPath = resolve(skillsDir, agentId, 'SKILL.md');
          if (!existsSync(skillPath)) {
            agentSkillMismatches++;
          }
        }
      }
    }
    if (agentSkillMismatches === 0) {
      logger.success('  [PASS] all agents have matching SKILL.md');
      passed++;
    } else {
      logger.warn(`  [WARN] ${agentSkillMismatches} agent(s) missing SKILL.md`);
      passed++; // warn, not fail
    }
  }

  // Test 6: Quality gates are configured
  if (existsSync(configPath)) {
    try {
      const { parseYamlFile } = await import('../utils/yaml.js');
      const config = parseYamlFile(configPath);
      if (config.gates && (config.gates.pre_commit || config.gates.pre_push)) {
        const gateCount = (config.gates.pre_commit || []).length + (config.gates.pre_push || []).length;
        logger.success(`  [PASS] ${gateCount} quality gate(s) configured`);
        passed++;
      } else {
        logger.warn('  [WARN] no quality gates configured');
        passed++;
      }
    } catch {
      logger.error('  [FAIL] could not parse operabase.yaml for gates');
      failed++;
    }
  }

  // Test 7: .operabase/ directory exists
  const operabaseDir = resolve(cwd, '.operabase');
  if (existsSync(operabaseDir)) {
    logger.success('  [PASS] .operabase/ directory exists');
    passed++;
  } else {
    logger.warn('  [WARN] .operabase/ directory not found (created on first pipeline run)');
    passed++;
  }

  // Summary
  console.log('');
  const total = passed + failed;
  if (failed === 0) {
    logger.success(`All ${total} tests passed.`);
  } else {
    logger.error(`${failed} of ${total} tests failed.`);
  }

  process.exit(failed > 0 ? 1 : 0);
}
