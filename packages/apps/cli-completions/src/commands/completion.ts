import { Command } from '@commander-js/extra-typings';
import { LlmToolsClient } from 'llm-tools-clients';
import { ProgramOptions } from '../cli';

export const completionCommand = new Command()
  .name('completion')
  .requiredOption('-d, --working-directory <text>', 'Current working directory')
  .option('-s, --server <url>', 'Server URL', 'http://localhost:8012')
  .option('-p, --prefix <text>', 'Input prefix text', '')
  .option('-h, --history <command...>', 'Recent command-line history', '')
  .option('-f, --files <file...>', 'Relevant file names', '')
  // .option('-x, --suffix <text>', 'Input suffix text', '')
  // .option('-t, --prompt <text>', 'Prompt text', '')
  // .option('-e, --extra <filename:content...>', 'Extra context', '')
  // .option('--multi-line', 'Enable returning multiple lines', false)
  .action(completionCommandAction);

type CompletionCommandOptions = ReturnType<typeof completionCommand.opts>;
type CompletionCommand = typeof completionCommand;

async function completionCommandAction(
  completionOptions: CompletionCommandOptions,
  command: CompletionCommand,
) {
  const optsWithGlobals: ProgramOptions & CompletionCommandOptions =
    command.optsWithGlobals();
  await completion(completionOptions, optsWithGlobals);
}

async function completion(
  completionOptions: CompletionCommandOptions,
  globalOptions?: { debug?: boolean },
) {
  // TODO: proper logging?
  if (globalOptions?.debug) {
    console.log('Completion options: ', completionOptions);
  }
  try {
    const client = new LlmToolsClient({
      type: 'llama-cpp',
      serverOrigin: completionOptions.server,
    });
    const history = Array.isArray(completionOptions.history)
      ? completionOptions.history.map((command) => ({
          command,
        }))
      : [];
    const response = await client.cliCompletion({
      promptPrefix: completionOptions.prefix,
      history,
      project: {
        path: completionOptions.workingDirectory,
        files: completionOptions.files ? completionOptions.files : [],
      },
    });
    process.stdout.write(response);
  } catch (error) {
    console.error('Error:', (error as { message?: unknown }).message || error);
    process.exit(1);
  }
}
