#!/usr/bin/env node

import { runCli } from './cli';

runCli();

// // import { Command, Option } from '@commander-js/extra-typings';
// // import { infill } from './infill';
// // import { completion } from './completion';
//
// function main() {
//   // // Setup CLI program
//   // const program = new Command()
//   //   .name('llm-tools')
//   //   // .description('A CLI tool to infill commands using an LLM model')
//   //   .version('0.0.1')
//   //   .addOption(
//   //     new Option('--debug', 'Enable debug logging')
//   //       // .hideHelp()
//   //       .env(`${ENV_VAR_PREFIX}_DEBUG`),
//   //   )
//   //   .addCommand(
//   //     new Command()
//   //       .name('infill')
//   //       .option('-s, --server <url>', 'Server URL', 'http://localhost:8012')
//   //       .option('-p, --prefix <text>', 'Input prefix text', '')
//   //       .option('-x, --suffix <text>', 'Input suffix text', '')
//   //       .option('-t, --prompt <text>', 'Prompt text', '')
//   //       .option('-e, --extra <filename:content...>', 'Extra context', '')
//   //       .option('--multi-line', 'Enable returning multiple lines', false)
//   //       .action(async function infillCommandAction(infillOptions, command) {
//   //         const optsWithGlobals = command.optsWithGlobals() as ProgramOptions &
//   //           typeof infillOptions;
//   //         await infill(infillOptions, optsWithGlobals);
//   //       }),
//   //   )
//   //   .addCommand(
//   //     new Command()
//   //       .name('completion')
//   //       .option('-s, --server <url>', 'Server URL', 'http://localhost:8012')
//   //       .option('-p, --prefix <text>', 'Input prefix text', '')
//   //       .option('-h, --history <command...>', 'Recent command-line history', '')
//   //       .option(
//   //         '-d, --working-directory <text>',
//   //         'Current working directory',
//   //         '',
//   //       )
//   //       .option('-f, --files <file...>', 'Relevant file names', '')
//   //       // .option('-x, --suffix <text>', 'Input suffix text', '')
//   //       // .option('-t, --prompt <text>', 'Prompt text', '')
//   //       // .option('-e, --extra <filename:content...>', 'Extra context', '')
//   //       // .option('--multi-line', 'Enable returning multiple lines', false)
//   //       .action(
//   //         async function completionCommandAction(completionOptions, command) {
//   //           const optsWithGlobals =
//   //             command.optsWithGlobals() as ProgramOptions &
//   //               typeof completionOptions;
//   //           await completion(completionOptions, optsWithGlobals);
//   //         },
//   //       ),
//   //   );
//   // //   .addHelpText(
//   // //     'after',
//   // //     ''
//   // //   );
//   //
//   // program.parse();
//   // const globalOptions = program.opts();
//   // type ProgramOptions = typeof globalOptions;
//   // if (globalOptions.debug) {
//   //   console.log('Options:', globalOptions);
//   // }
// }
//
// main();
