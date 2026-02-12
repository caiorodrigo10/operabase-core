#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('operabase')
  .description('Skills-first agent framework for Claude Code')
  .version(pkg.version);

program
  .command('validate')
  .description('Validate operabase.yaml against the JSON Schema')
  .action(async () => {
    const { runValidate } = await import('../src/cli/validate.js');
    runValidate();
  });

program
  .command('status')
  .description('Show installed squads, version, and state')
  .action(async () => {
    const { runStatus } = await import('../src/cli/status.js');
    runStatus();
  });

program
  .command('init')
  .description('Initialize a new Operabase project')
  .action(async () => {
    const { runInit } = await import('../src/cli/init.js');
    await runInit();
  });

program
  .command('state')
  .description('Show or manage pipeline state')
  .argument('[action]', 'Action: clear')
  .action(async (action) => {
    const { runState } = await import('../src/cli/state-cmd.js');
    await runState(action);
  });

program
  .command('gates')
  .description('Run quality gates (lint, typecheck, test)')
  .option('--stage <stage>', 'Run only a specific stage (pre_commit, pre_push)')
  .option('--squad <squad>', 'Include squad-specific gates')
  .action(async (options) => {
    const { runGates } = await import('../src/cli/gates.js');
    await runGates(options);
  });

program
  .command('doctor')
  .description('Run diagnostic checks on your Operabase project')
  .action(async () => {
    const { runDoctor } = await import('../src/cli/doctor.js');
    await runDoctor();
  });

program
  .command('upgrade')
  .description('Upgrade an existing Operabase project')
  .action(async () => {
    const { runUpgrade } = await import('../src/cli/upgrade.js');
    await runUpgrade();
  });

program
  .command('events')
  .description('View recent hook-based events')
  .argument('[count]', 'Number of recent events to show (default: 20)')
  .action(async (count) => {
    const { runEvents } = await import('../src/cli/events.js');
    await runEvents(count);
  });

program
  .command('test')
  .description('Run smoke tests for the Operabase setup')
  .action(async () => {
    const { runSmokeTests } = await import('../src/cli/smoke-tests.js');
    await runSmokeTests();
  });

program
  .command('tenants')
  .description('List configured tenants')
  .action(async () => {
    const { runTenants } = await import('../src/cli/tenants-cmd.js');
    await runTenants();
  });

// Global error handling
program.exitOverride();

try {
  await program.parseAsync();
} catch (error) {
  if (error.code === 'commander.helpDisplayed' || error.code === 'commander.version') {
    process.exit(0);
  }
  const chalk = (await import('chalk')).default;
  console.error(chalk.red(`\n  Error: ${error.message}`));
  console.error(chalk.dim('  Run "npx operabase --help" for usage information.\n'));
  process.exit(1);
}
