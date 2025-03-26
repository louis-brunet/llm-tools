/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it, TestContext } from 'node:test';
import { runCli } from './cli';
import { InfillCommandOptions } from './commands/infill';

// const commandsToTest = [
//   { command: 'infill', options: {} satisfies InfillCommandOptions },
// ];

describe('cli', () => {
  describe('runCli', () => {
    it('is defined', (t: TestContext) => {
      t.assert.ok(runCli);
    });

    // it.todo('is tested', (t: TestContext) => {
    //   t.assert.ok(false);
    // });
  });
});
