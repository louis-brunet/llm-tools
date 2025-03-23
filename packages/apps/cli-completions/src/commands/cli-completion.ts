import { Command } from '@commander-js/extra-typings';
import { LlmToolsService } from '@llm-tools/clients';
import { ProgramOptions } from '../cli';

export const cliCompletionCommand = new Command()
  .name('cli-completion')
  .requiredOption('-d, --working-directory <text>', 'Current working directory')
  .option('-s, --server <url>', 'Server URL', 'http://localhost:8012')
  .option('-p, --prefix <text>', 'Input prefix text', '')
  .option('-x, --suffix <text>', 'Input suffix text', '')
  .option('-h, --history <command...>', 'Recent command-line history', '')
  .option('-f, --files <file...>', 'Relevant file names', '')
  .action(cliCompletionCommandAction);

type CliCompletionCommandOptions = ReturnType<typeof cliCompletionCommand.opts>;
type CliCompletionCommand = typeof cliCompletionCommand;

async function cliCompletionCommandAction(
  completionOptions: CliCompletionCommandOptions,
  command: CliCompletionCommand,
) {
  const optsWithGlobals: ProgramOptions & CliCompletionCommandOptions =
    command.optsWithGlobals();
  await cliCompletion(completionOptions, optsWithGlobals);
}

async function cliCompletion(
  completionOptions: CliCompletionCommandOptions,
  globalOptions?: { debug?: boolean },
) {
  // TODO: proper logging
  if (globalOptions?.debug) {
    console.log('Completion options: ', completionOptions);
  }
  try {
    const client = new LlmToolsService({
      backend: 'llama-cpp',
      serverOrigin: completionOptions.server,
    });
    const history = Array.isArray(completionOptions.history)
      ? completionOptions.history.map((command) => ({
          command,
        }))
      : [];
    const response = await client.cliCompletion({
      promptPrefix: completionOptions.prefix,
      promptSuffix: completionOptions.suffix,
      history,
      project: {
        path: completionOptions.workingDirectory,
        files: completionOptions.files ? completionOptions.files : [],
      },
    });
    process.stdout.write(response);
  } catch (error) {
    console.error('Error:', (error as { message?: unknown }).message || error);
    throw error;
    // process.exit(1);
  }
}
