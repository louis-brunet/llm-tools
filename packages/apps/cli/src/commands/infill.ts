import { Command, Option } from '@commander-js/extra-typings';
import {
  ILlmToolsInfillRequestExtraContext,
  LlamaCppModelEnum,
  LlmToolsBackendEnum,
  LlmToolsService,
  LlmToolsServiceConfig,
} from '@llm-tools/clients';
import { ProgramOptions } from '../cli';
import { ENVIRONMENT_CONFIG } from '../config';

const ENV_PREFIX = ENVIRONMENT_CONFIG.prefix.infill;

export const infillCommand = new Command()
  .name('infill')
  .option('--server <url>', 'Server URL', 'http://localhost:8012')
  .option('--prefix <text>', 'Input prefix text', '')
  .option('--suffix <text>', 'Input suffix text', '')
  .option('--prompt <text>', 'Prompt text', '')
  .option('--extra <filename:content...>', 'Extra context', [] as string[])
  .option('--multi-line', 'Enable returning multiple lines', false)
  .addOption(
    new Option('--backend <text>', 'LLM backend type')
      .choices(Object.values(LlmToolsBackendEnum))
      .default(LlmToolsBackendEnum.LLAMA_CPP)
      .env(`${ENV_PREFIX}_BACKEND`),
  )
  .action(infillCommandAction);

export type InfillCommandOptions = ReturnType<typeof infillCommand.opts>;
type InfillCommand = typeof infillCommand;

async function infillCommandAction(
  infillOptions: InfillCommandOptions,
  command: InfillCommand,
) {
  const optsWithGlobals: ProgramOptions & InfillCommandOptions =
    command.optsWithGlobals();
  const result = await infill(infillOptions, optsWithGlobals);
  process.stdout.write(result);
}

export async function infill(
  infillOptions: InfillCommandOptions,
  globalOptions?: { debug?: boolean },
): Promise<string> {
  if (globalOptions?.debug) {
    console.debug('Infill options: ', infillOptions);
  }
  // Initialize client
  let backendConfig: LlmToolsServiceConfig;
  switch (infillOptions.backend) {
    case LlmToolsBackendEnum.LLAMA_CPP:
      backendConfig = {
        backend: infillOptions.backend,
        serverOrigin: infillOptions.server,
        model: LlamaCppModelEnum.QWEN_2_5_CODER,
      };
      break;
    case LlmToolsBackendEnum.OLLAMA:
      backendConfig = {
        backend: infillOptions.backend,
        model: 'qwen2.5-coder',
        serverOrigin: infillOptions.server,
      };
  }
  const client = new LlmToolsService(backendConfig);

  let extraContext: ILlmToolsInfillRequestExtraContext[] | undefined =
    undefined;
  if (infillOptions.extra.length > 0) {
    const separator = ':';
    extraContext = [];
    for (const extraItem of infillOptions.extra) {
      const separatorIndex = extraItem.indexOf(separator);
      if (separatorIndex === -1) {
        throw new TypeError(`invalid extra context format: ${extraItem}`);
      }
      const fileName = extraItem.substring(0, separatorIndex);
      const text = extraItem.substring(separatorIndex + 1);
      if (text) {
        extraContext.push({
          fileName,
          text,
        });
      }
    }
  }

  // Make the request
  const response = await client.infill({
    inputPrefix: infillOptions.prefix,
    prompt: infillOptions.prompt,
    inputSuffix: infillOptions.suffix,
    inputExtra: extraContext,
  });
  let result = response.content;

  // TODO: this should be done with an array of stop strings in the request
  if (!infillOptions.multiLine) {
    const newlineIndex = result.indexOf('\n');
    if (newlineIndex >= 0) {
      result = result.substring(0, newlineIndex);
    }
  }
  return result;
}
