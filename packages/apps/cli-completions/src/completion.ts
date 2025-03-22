// import { LlmToolsClient } from 'llm-tools-clients';
//
// export interface ICompletionOptions {
//   server: string;
//   prefix: string;
//   history: '' | string[];
//   workingDirectory: string;
//   files: '' | string[];
// }
//
// export async function completion(
//   completionOptions: ICompletionOptions,
//   globalOptions?: { debug?: boolean },
// ) {
//   if (globalOptions?.debug) {
//     console.log('Completion options: ', completionOptions);
//   }
//   try {
//     const client = new LlmToolsClient({
//       type: 'llama-cpp',
//       serverOrigin: completionOptions.server,
//     });
//     const history = Array.isArray(completionOptions.history)
//       ? completionOptions.history.map((command) => ({
//           command,
//         }))
//       : [];
//     const response = await client.cliCompletion({
//       promptPrefix: completionOptions.prefix,
//       history,
//       directory: {
//         path: completionOptions.workingDirectory,
//         files: completionOptions.files ? completionOptions.files : [],
//       },
//     });
//     process.stdout.write(response);
//   } catch (error) {
//     console.error('Error:', (error as { message?: unknown }).message || error);
//     process.exit(1);
//   }
// }
