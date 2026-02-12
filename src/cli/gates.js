import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { logger } from '../utils/logger.js';
import { parseYamlFile } from '../utils/yaml.js';
import { emitEvent } from './events.js';

/**
 * Run quality gates.
 * @param {object} options
 * @param {string} [options.stage] - 'pre_commit' or 'pre_push'
 * @param {string} [options.squad] - Specific squad name
 */
export async function runGates(options = {}) {
  const cwd = process.cwd();
  const { stage, squad } = options;

  logger.heading('Running quality gates...');

  // 1. Load global gates from operabase.yaml
  let config;
  try {
    config = parseYamlFile(resolve(cwd, 'operabase.yaml'));
  } catch {
    logger.error('operabase.yaml not found. Run "npx operabase init" first.');
    process.exit(1);
  }

  const globalGates = config?.gates || {};

  // 2. Determine which stages to run
  let stagesToRun = [];
  if (stage) {
    stagesToRun = [stage];
  } else {
    stagesToRun = Object.keys(globalGates);
  }

  if (stagesToRun.length === 0) {
    logger.info('No gates configured in operabase.yaml.');
    return;
  }

  // 3. Load squad-specific gates if --squad flag
  let squadGates = {};
  if (squad) {
    try {
      const squadGatesPath = resolve(cwd, `squads/${squad}/config/quality-gates.yaml`);
      squadGates = parseYamlFile(squadGatesPath)?.gates || {};
    } catch {
      logger.warn(`No quality-gates.yaml found for squad "${squad}". Using global gates only.`);
    }
  }

  // 4. Run gates per stage, merging global + squad-specific
  let allPassed = true;
  let passCount = 0;
  let failCount = 0;

  for (const stg of stagesToRun) {
    logger.heading(`Stage: ${stg}`);

    // Collect commands for this stage
    let commands = [];

    // Global gates for this stage
    if (globalGates[stg]) {
      const globalCmds = globalGates[stg];
      if (Array.isArray(globalCmds)) {
        commands.push(...globalCmds);
      }
    }

    // Squad additional gates for this stage (extends global)
    if (squadGates.additional?.[stg]) {
      const additionalCmds = squadGates.additional[stg];
      if (Array.isArray(additionalCmds)) {
        commands.push(...additionalCmds.map(g => typeof g === 'string' ? g : g.command || g.description || String(g)));
      }
    }

    // Squad override: if squad defines override for a stage, replace global commands
    if (squadGates.override?.[stg]) {
      const overrideCmds = squadGates.override[stg];
      if (Array.isArray(overrideCmds)) {
        commands = overrideCmds.map(g => typeof g === 'string' ? g : g.command || String(g));
      }
    }

    if (commands.length === 0) {
      logger.info(`  No gates for stage "${stg}".`);
      continue;
    }

    emitEvent(cwd, { event: 'gates_start', agent: 'system', phase: stg, data: { stage: stg, gateCount: commands.length } });

    // 5. Execute each gate sequentially
    for (const cmd of commands) {
      let passed = true;
      try {
        logger.info(`  Running: ${cmd}`);
        execSync(cmd, { cwd, stdio: 'pipe', timeout: 120000 });
        logger.success(`  ${cmd}`);
        passCount++;
      } catch (error) {
        passed = false;
        logger.error(`  ${cmd}`);
        if (error.stderr) {
          const stderr = error.stderr.toString().trim();
          if (stderr) logger.error(`    ${stderr.split('\n')[0]}`);
        }
        failCount++;
        allPassed = false;
      }
      emitEvent(cwd, { event: 'gate_result', agent: 'system', phase: stg, data: { gate: cmd, status: passed ? 'pass' : 'fail' } });
    }
  }

  // 6. Emit completion event
  emitEvent(cwd, { event: 'gates_complete', agent: 'system', phase: stage || 'all', data: { passed: passCount, failed: failCount, total: passCount + failCount } });

  // 7. Summary
  console.log('');
  if (allPassed) {
    logger.success(`All gates passed (${passCount}/${passCount}).`);
  } else {
    logger.error(`Gates failed: ${failCount} failed, ${passCount} passed.`);
    process.exit(1);
  }
}
