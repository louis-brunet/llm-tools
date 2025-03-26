import { Command, Option } from '@commander-js/extra-typings';
import { infillCommand } from './commands/infill';
import { cliCompletionCommand } from './commands/cli-completion';
import { APP_CONFIG, ENVIRONMENT_CONFIG } from './config';

const program = new Command()
  .name(APP_CONFIG.appName)
  // .description('A CLI tool to infill commands using an LLM model')
  .version(APP_CONFIG.appVersion)
  .addOption(
    new Option('--debug', 'Enable debug logging')
      // .hideHelp()
      .env(`${ENVIRONMENT_CONFIG.prefix.global}_DEBUG`),
  )
  .addCommand(infillCommand)
  .addCommand(cliCompletionCommand);
//   .addHelpText(
//     'after',
//     ''
//   );

export type ProgramOptions = ReturnType<typeof program.opts>;

export async function runCli() {
  const parsed = await program.parseAsync();
  const globalOptions = parsed.opts();
  if (globalOptions.debug) {
    console.log('Options:', globalOptions);
  }
  return parsed;
}
