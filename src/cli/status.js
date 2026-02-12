import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { logger } from '../utils/logger.js';
import { parseYamlFile } from '../utils/yaml.js';

/**
 * CLI handler for "operabase status".
 * Shows installed squads, version, and state info.
 */
export function runStatus() {
  const cwd = process.cwd();
  const configPath = resolve(cwd, 'operabase.yaml');
  const pkgPath = resolve(cwd, 'package.json');
  const statePath = resolve(cwd, '.operabase/state.json');

  logger.heading('Operabase Status');
  logger.blank();

  // Check operabase.yaml
  if (!existsSync(configPath)) {
    logger.error('No operabase.yaml found in current directory.');
    logger.dim('Run "npx operabase init" to set up a new project.');
    logger.blank();
    process.exit(1);
  }

  let config;
  try {
    config = parseYamlFile(configPath);
  } catch (err) {
    logger.error(`Failed to parse operabase.yaml: ${err.message}`);
    process.exit(1);
  }

  // Project info
  logger.label('Project', config.name || 'unnamed');
  logger.label('Config version', config.version || 'unknown');
  logger.label('Language', config.language || 'not set');
  logger.label('Multi-tenant', config.multi_tenant ? 'yes' : 'no');
  logger.blank();

  // Squads
  const coreSquads = config.squads?.core || [];
  const extraSquads = config.squads?.extras || [];

  logger.heading('Squads');
  if (coreSquads.length > 0) {
    for (const squad of coreSquads) {
      const squadDir = resolve(cwd, 'squads', squad);
      const installed = existsSync(squadDir);
      if (installed) {
        logger.success(`${squad} (core)`);
      } else {
        logger.warn(`${squad} (core) - directory not found`);
      }
    }
  } else {
    logger.dim('  No core squads configured.');
  }

  if (extraSquads.length > 0) {
    for (const squad of extraSquads) {
      const squadDir = resolve(cwd, 'squads', squad);
      const installed = existsSync(squadDir);
      if (installed) {
        logger.success(`${squad} (extra)`);
      } else {
        logger.warn(`${squad} (extra) - directory not found`);
      }
    }
  }
  logger.blank();

  // Quality gates
  if (config.gates) {
    logger.heading('Quality Gates');
    if (config.gates.pre_commit?.length > 0) {
      logger.label('pre_commit', config.gates.pre_commit.join(', '));
    }
    if (config.gates.pre_push?.length > 0) {
      logger.label('pre_push', config.gates.pre_push.join(', '));
    }
    logger.blank();
  }

  // Integrations
  logger.heading('Integrations');
  logger.label('Composio', config.composio?.enabled ? 'enabled' : 'disabled');
  logger.label('Obsidian', config.obsidian?.enabled ? `enabled (${config.obsidian.vault_path || 'no path'})` : 'disabled');
  logger.label('RAG', config.rag?.enabled ? 'enabled' : 'disabled');
  logger.blank();

  // State
  if (existsSync(statePath)) {
    try {
      const state = JSON.parse(readFileSync(statePath, 'utf-8'));
      logger.heading('Pipeline State');
      logger.label('Pipeline ID', state.pipeline_id || 'none');
      logger.label('Current phase', state.current_phase || 'idle');
      logger.label('Started at', state.started_at || 'N/A');
      logger.blank();
    } catch {
      logger.dim('  State file exists but could not be read.');
    }
  } else {
    logger.dim('No active pipeline state.');
    logger.blank();
  }
}
