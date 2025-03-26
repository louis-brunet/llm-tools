import { Command } from '@commander-js/extra-typings';
import {
  ILlmToolsInfillRequestExtraContext,
  LlmToolsBackendEnum,
  LlmToolsService,
} from '@llm-tools/clients';
import { ProgramOptions } from '../cli';

export const infillCommand = new Command()
  .name('infill')
  .option('-s, --server <url>', 'Server URL', 'http://localhost:8012')
  .option('-p, --prefix <text>', 'Input prefix text', '')
  .option('-x, --suffix <text>', 'Input suffix text', '')
  .option('-t, --prompt <text>', 'Prompt text', '')
  .option('-e, --extra <filename:content...>', 'Extra context', [] as string[])
  .option('--multi-line', 'Enable returning multiple lines', false)
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
  // try {
  // Initialize client
  const client = new LlmToolsService({
    backend: LlmToolsBackendEnum.LLAMA_CPP,
    serverOrigin: infillOptions.server,
  });

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
  // process.stdout.write(result);
  // } catch (error) {
  //   console.error('Error:', (error as { message?: unknown }).message || error);
  //   process.exit(1);
  // }
}
