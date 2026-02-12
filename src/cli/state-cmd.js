// CLI command: npx operabase state [action]
// Shows current pipeline state or manages it.

import { logger } from '../utils/logger.js';
import { getPipelineStatus, clear, load } from '../core/state.js';

/**
 * Run the state command.
 * @param {string|undefined} action - Optional action: "clear"
 */
export async function runState(action) {
  const cwd = process.cwd();

  if (action === 'clear') {
    const state = await load(cwd);
    if (!state) {
      logger.warn('No active pipeline state to clear.');
      return;
    }
    await clear(cwd);
    logger.success('Pipeline state cleared.');
    return;
  }

  if (action && action !== 'clear') {
    logger.error(`Unknown action: "${action}". Use "clear" or omit for status.`);
    process.exitCode = 1;
    return;
  }

  // Default: show pipeline status
  const status = await getPipelineStatus(cwd);

  if (!status) {
    logger.info('No active pipeline.');
    return;
  }

  logger.heading('Pipeline State');
  logger.label('Pipeline ID', status.id);
  logger.label('Current Phase', status.currentPhase || '(none)');
  logger.label('Progress', status.progress);
  logger.label('Paused', status.paused ? 'Yes' : 'No');

  if (status.error) {
    logger.label('Error', JSON.stringify(status.error));
  }

  // Show phase details
  const state = await load(cwd);
  if (state && state.phases.length > 0) {
    logger.blank();
    logger.heading('Phases');
    for (const phase of state.phases) {
      const icon = {
        pending: '  ',
        running: '>>',
        completed: 'OK',
        failed: '!!',
        skipped: '--',
      }[phase.status] || '??';

      const agent = phase.agent ? ` (${phase.agent})` : '';
      logger.info(`[${icon}] ${phase.name}${agent} — ${phase.status}`);
    }
  }

  logger.blank();
}
