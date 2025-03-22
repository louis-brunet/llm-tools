// import { LlmToolsClient } from 'llm-tools-clients';
//
// export interface IInfillOptions {
//   server: string;
//   prefix: string;
//   suffix: string;
//   prompt: string;
//   extra: '' | string[];
//   multiLine: boolean;
// }
//
// // export const infillCommand =      new Command()
// //         .name('infill')
// //         .option('-s, --server <url>', 'Server URL', 'http://localhost:8012')
// //         .option('-p, --prefix <text>', 'Input prefix text', '')
// //         .option('-x, --suffix <text>', 'Input suffix text', '')
// //         .option('-t, --prompt <text>', 'Prompt text', '')
// //         .option('-e, --extra <filename:content...>', 'Extra context', '')
// //         .option('--multi-line', 'Enable returning multiple lines', false)
// //         .action(async function infillCommandAction(infillOptions, command) {
// //           const optsWithGlobals = command.optsWithGlobals() as ProgramOptions &
// //             typeof infillOptions;
// //           await infill(infillOptions, optsWithGlobals);
// //         }),
//
// async function infill(
//   infillOptions: IInfillOptions,
//   globalOptions?: { debug?: boolean },
// ) {
//   if (globalOptions?.debug) {
//     console.log('Infill options: ', infillOptions);
//   }
//   try {
//     // Initialize client
//     // const client = new LlamaCppClient({ serverOrigin: options.server });
//     const client = new LlmToolsClient({
//       type: 'llama-cpp',
//       serverOrigin: infillOptions.server,
//     }); //({ serverOrigin: options.server });
//
//     // Validate required inputs
//     // if (!options.prefix && !options.suffix) {
//     //   console.error(
//     //     'Error: At least one of --prefix or --suffix must be provided',
//     //   );
//     //   program.help();
//     //   process.exit(1);
//     // }
//
//     // let extraContext: ILlamaCppInfillRequestExtraContext[] | undefined =
//     let extraContext: ILlmToolsInfillRequestExtraContext[] | undefined =
//       undefined;
//     if (
//       infillOptions.extra &&
//       Array.isArray(infillOptions.extra) &&
//       infillOptions.extra.length > 0
//     ) {
//       const separator = ':';
//       extraContext = [];
//       for (const extraItem of infillOptions.extra) {
//         const separatorIndex = extraItem.indexOf(separator);
//         if (separatorIndex === -1) {
//           console.error(`Invalid extra context format: ${extraItem}`);
//           process.exit(1);
//         }
//         const fileName = extraItem.substring(0, separatorIndex);
//         const text = extraItem.substring(separatorIndex + 1);
//         if (text) {
//           extraContext.push({
//             fileName,
//             text,
//           });
//         }
//       }
//     }
//
//     // Make the request
//     const response = await client.infill({
//       inputPrefix: infillOptions.prefix,
//       prompt: infillOptions.prompt,
//       inputSuffix: infillOptions.suffix,
//       inputExtra: extraContext,
//     });
//     // const response = await client.infill({
//     //   input_prefix: options.prefix,
//     //   prompt: options.prompt,
//     //   input_suffix: options.suffix,
//     //   input_extra: extraContext,
//     // });
//     let result = response.content;
//
//     if (!infillOptions.multiLine) {
//       const newlineIndex = result.indexOf('\n');
//       if (newlineIndex >= 0) {
//         result = result.substring(0, newlineIndex);
//       }
//     }
//     process.stdout.write(result);
//   } catch (error) {
//     console.error('Error:', (error as { message?: unknown }).message || error);
//     process.exit(1);
//   }
// }
