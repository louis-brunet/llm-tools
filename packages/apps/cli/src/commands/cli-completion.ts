import { Command, Option } from '@commander-js/extra-typings';
import {
  LlmToolsBackendEnum,
  LlmToolsService,
  LlmToolsServiceConfig,
} from '@llm-tools/clients';
import { ProgramOptions } from '../cli';
import { ENVIRONMENT_CONFIG } from '../config';

const ENV_PREFIX = ENVIRONMENT_CONFIG.prefix.cliCompletion;

export const cliCompletionCommand = new Command()
  .name('cli-completion')
  .requiredOption('-d, --working-directory <text>', 'Current working directory')
  .option('-p, --prefix <text>', 'Input prefix text', '')
  .option('-x, --suffix <text>', 'Input suffix text', '')
  .option(
    '--recent-history <command...>',
    'Recent command-line history',
    [] as string[],
  )
  .option(
    '--matched-history <command...>',
    'Command-line history matching the given prefix and suffix',
    [] as string[],
  )
  .option('-f, --files <file...>', 'Relevant file names', [] as string[])
  .addOption(
    new Option('-s, --server <url>', 'Server URL')
      .default('http://localhost:8012')
      .env(`${ENV_PREFIX}_SERVER`),
  )
  .addOption(
    new Option('--backend <text>', 'LLM backend type')
      .choices(Object.values(LlmToolsBackendEnum))
      .default(LlmToolsBackendEnum.LLAMA_CPP)
      .env(`${ENV_PREFIX}_BACKEND`),
  )
  .addOption(
    new Option('--shell <text>', 'Shell being used')
      .default('zsh')
      .env(`${ENV_PREFIX}_SHELL`),
  )
  .action(cliCompletionCommandAction);

export type CliCompletionCommandOptions = ReturnType<
  typeof cliCompletionCommand.opts
>;
type CliCompletionCommand = typeof cliCompletionCommand;

async function cliCompletionCommandAction(
  completionOptions: CliCompletionCommandOptions,
  command: CliCompletionCommand,
) {
  const optsWithGlobals: ProgramOptions & CliCompletionCommandOptions =
    command.optsWithGlobals();
  await cliCompletion(completionOptions, optsWithGlobals);
}

export async function cliCompletion(
  completionOptions: CliCompletionCommandOptions,
  globalOptions?: { debug?: boolean },
) {
  // TODO: proper logging
  if (globalOptions?.debug) {
    console.log('Completion options: ', completionOptions);
  }
  try {
    let backendConfig: LlmToolsServiceConfig;
    switch (completionOptions.backend) {
      case LlmToolsBackendEnum.LLAMA_CPP:
        backendConfig = {
          backend: completionOptions.backend,
          serverOrigin: completionOptions.server,
        };
        break;
      case LlmToolsBackendEnum.OLLAMA:
        backendConfig = {
          backend: completionOptions.backend,
        };
    }
    const client = new LlmToolsService(backendConfig);
    const history = completionOptions.recentHistory.map((command) => ({
      command,
    }));
    const matchedHistory = completionOptions.matchedHistory.map((command) => ({
      command,
    }));
    const response = await client.cliCompletion({
      promptPrefix: completionOptions.prefix,
      promptSuffix: completionOptions.suffix,
      history,
      matchedHistory,
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
  }
}
