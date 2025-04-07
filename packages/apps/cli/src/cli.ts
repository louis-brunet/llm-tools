import { Command, Option } from '@commander-js/extra-typings';
import { infillCommand } from './commands/infill';
import { cliCompletionCommand } from './commands/cli-completion';
import { APP_CONFIG, ENVIRONMENT_CONFIG } from './config';

const program = new Command()
  .name(APP_CONFIG.appName)
  .description('Interact with various LLMs from the command line')
  .version(APP_CONFIG.appVersion)
  .addOption(
    new Option('--debug', 'Enable debug logging')
      // .hideHelp()
      .env(`${ENVIRONMENT_CONFIG.prefix.global}_DEBUG`),
  )
  .addCommand(infillCommand)
  .addCommand(cliCompletionCommand);

export type ProgramOptions = ReturnType<typeof program.opts>;

export async function runCli() {
  const parsed = await program.parseAsync();
  const globalOptions = parsed.opts();
  if (globalOptions.debug) {
    console.log('Options:', globalOptions);
  }
  return parsed;
}
