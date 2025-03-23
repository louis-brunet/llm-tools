import { Command, Option } from '@commander-js/extra-typings';
import { infillCommand } from './commands/infill';
import { cliCompletionCommand } from './commands/cli-completion';

export const ENV_VAR_PREFIX = 'LLM_TOOLS';

const program = new Command()
  .name('llm-tools')
  // .description('A CLI tool to infill commands using an LLM model')
  .version('0.0.1')
  .addOption(
    new Option('--debug', 'Enable debug logging')
      // .hideHelp()
      .env(`${ENV_VAR_PREFIX}_DEBUG`),
  )
  .addCommand(infillCommand)
  .addCommand(cliCompletionCommand);
//   .addHelpText(
//     'after',
//     ''
//   );

export type ProgramOptions = ReturnType<typeof program.opts>;

export function runCli() {
  const parsed = program.parse();
  const globalOptions = parsed.opts();
  if (globalOptions.debug) {
    console.log('Options:', globalOptions);
  }
  return parsed;
}
