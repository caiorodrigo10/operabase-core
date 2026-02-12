import chalk from 'chalk';

export const logger = {
  info(msg) {
    console.log(chalk.blue('i'), msg);
  },

  success(msg) {
    console.log(chalk.green('✓'), msg);
  },

  warn(msg) {
    console.log(chalk.yellow('!'), msg);
  },

  error(msg) {
    console.log(chalk.red('✗'), msg);
  },

  heading(msg) {
    console.log(chalk.bold.cyan(`\n${msg}`));
  },

  dim(msg) {
    console.log(chalk.dim(msg));
  },

  label(label, value) {
    console.log(`  ${chalk.gray(label + ':')} ${value}`);
  },

  blank() {
    console.log();
  }
};
