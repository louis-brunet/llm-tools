import { Command, Option } from '@commander-js/extra-typings';
import { LlmToolsBackendType, LlmToolsClientConfig, LlmToolsService } from '@llm-tools/clients';
import { ProgramOptions } from '../cli';
import { ENVIRONMENT_CONFIG } from '../config';
import { request } from 'http';

const ENV_PREFIX = ENVIRONMENT_CONFIG.prefix.cliCompletion;
export const cliCompletionCommand = new Command()
  .name('cli-completion')
  .requiredOption('-d, --working-directory <text>', 'Current working directory')
  .option('-p, --prefix <text>', 'Input prefix text', '')
  .option('-x, --suffix <text>', 'Input suffix text', '')
  .option(
    '-h, --history <command...>',
    'Recent command-line history',
    [] as string[],
  )
  .option('-f, --files <file...>', 'Relevant file names', [] as string[])
  .addOption(
    new Option('-s, --server <url>', 'Server URL')
      .default('http://localhost:8012')
      .env(`${ENV_PREFIX}_SERVER`),
  )
  .addOption(
    new Option('-b, --backend <text>', 'LLM backend type')
      .choices(['llama-cpp', 'ollama'] satisfies LlmToolsBackendType[])
      .default('llama-cpp')
      .env(`${ENV_PREFIX}_BACKEND`),
  )
  .addOption(
    new Option('--shell <text>', 'Shell being used')
      .default('zsh')
      .env(`${ENV_PREFIX}_SHELL`),
  )
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
    let backendConfig: LlmToolsClientConfig;
    switch (completionOptions.backend) {
      case 'llama-cpp':
        backendConfig = {
          backend: completionOptions.backend,
          serverOrigin: completionOptions.server,
        };
        break;
      case 'ollama':
        throw new Error('Ollama backend not implemented yet');
    }
    const client = new LlmToolsService(backendConfig);
    const history = Array.isArray(completionOptions.history)
      ? completionOptions.history.map((command) => ({
          command,
        }))
      : [];
    const response = await client.cliCompletion({
      promptPrefix: completionOptions.prefix,
      promptSuffix: completionOptions.suffix,
      history,
      shell: completionOptions.shell,
      project: {
        path: completionOptions.workingDirectory,
        files: completionOptions.files,
      },
    });
    process.stdout.write(response);
  } catch (error) {
    console.error('Error:', (error as { message?: unknown }).message || error);
    throw error;
    // process.exit(1);
  }
}
