import { resolve } from 'node:path';
import { validateConfig } from '../core/config-validator.js';
import { logger } from '../utils/logger.js';

/**
 * CLI handler for "operabase validate".
 * Validates operabase.yaml against the JSON Schema.
 */
export function runValidate() {
  const configPath = resolve(process.cwd(), 'operabase.yaml');

  logger.heading('Operabase Validate');
  logger.dim(`Checking ${configPath}`);
  logger.blank();

  const result = validateConfig(configPath);

  if (result.valid) {
    logger.success('operabase.yaml is valid.');
    logger.blank();
    logger.label('Name', result.config.name);
    logger.label('Version', result.config.version);
    logger.label('Language', result.config.language);

    if (result.config.squads) {
      const core = result.config.squads.core || [];
      const extras = result.config.squads.extras || [];
      logger.label('Core squads', core.join(', ') || 'none');
      logger.label('Extra squads', extras.join(', ') || 'none');
    }

    logger.blank();
    process.exit(0);
  } else {
    logger.error('operabase.yaml has validation errors:');
    logger.blank();

    for (const err of result.errors) {
      if (err.instancePath) {
        logger.error(`  ${err.instancePath}: ${err.message}`);
      } else {
        logger.error(`  ${err.message}`);
      }
    }

    logger.blank();
    process.exit(1);
  }
}
