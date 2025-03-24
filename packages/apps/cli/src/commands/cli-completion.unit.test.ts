import { describe, it, TestContext } from 'node:test';
import {
  cliCompletion,
  cliCompletionCommand,
  CliCompletionCommandOptions,
} from './cli-completion';

void describe('cliCompletion', async () => {
  // const validCliCompletionCommandOptions: CliCompletionCommandOptions = {
  //   server: 'some-server',
  //   prefix: 'some-prefix',
  //   suffix: 'some-suffix',
  //   backend: 'llama-cpp',
  //   workingDirectory: '/some/path',
  //   files: ['some-file'],
  //   matchedHistory: ['FOOsome-prefixBARsome-suffixBAZ'],
  //   recentHistory: ['toto', 'titi'],
  //   shell: 'zsh',
  // };

  await it('is defined', (t: TestContext) => {
    t.assert.ok(cliCompletionCommand);
    t.assert.ok(cliCompletion);
  });

  await it('is tested', (t: TestContext) => {
    t.assert.ok(false);
  });
});
