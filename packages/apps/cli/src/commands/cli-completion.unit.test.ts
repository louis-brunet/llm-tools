/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it, TestContext } from 'node:test';
import {
  cliCompletion,
  cliCompletionCommand,
  CliCompletionCommandOptions,
} from './cli-completion';
import {
  ILlmToolsCliCompletionRequest,
  LlmToolsBackendEnum,
  LlmToolsService,
} from '@llm-tools/clients';

const baseOptions = {
  server: 'some-server',
  prefix: 'some-prefix',
  suffix: 'some-suffix',
  workingDirectory: '/some/path',
  files: ['some-file'],
  matchedHistory: ['FOOsome-prefixBARsome-suffixBAZ'],
  recentHistory: ['toto', 'titi'],
  shell: 'zsh',
} satisfies Partial<CliCompletionCommandOptions>;

const backendsToTest = Object.values(LlmToolsBackendEnum).map(
  (backend) =>
    ({
      backend,
    }) as const,
);

describe('cliCompletion (unit)', () => {
  it('is defined', (t: TestContext) => {
    t.assert.ok(cliCompletionCommand);
    t.assert.ok(cliCompletion);
  });

  for (const { backend } of backendsToTest) {
    describe(`with backend ${backend}`, () => {
      it('calls library with expected inputs', async (t: TestContext) => {
        const request = { ...baseOptions, backend };
        const expectedRequest: ILlmToolsCliCompletionRequest = {
          promptPrefix: request.prefix,
          promptSuffix: request.suffix,
          history: request.recentHistory.map((command) => ({ command })),
          matchedHistory: request.matchedHistory.map((command) => ({
            command,
          })),
          shell: request.shell,
          project: {
            path: request.workingDirectory,
            files: request.files,
          },
        };
        const mockResponse = 'some response';
        const cliCompletionMock = t.mock.method(
          LlmToolsService.prototype,
          'cliCompletion',
        );
        cliCompletionMock.mock.mockImplementation((_request) => {
          return Promise.resolve(mockResponse);
        });
        const processStdoutMock = t.mock.method(process.stdout, 'write');
        processStdoutMock.mock.mockImplementation(() => true);

        await cliCompletion(request);

        t.assert.strictEqual(cliCompletionMock.mock.callCount(), 1);
        t.assert.deepStrictEqual(
          cliCompletionMock.mock.calls[0].arguments[0],
          expectedRequest,
        );
        t.assert.ok(processStdoutMock.mock.callCount() >= 1);
      });

      it('logs result to stdout', async (t: TestContext) => {
        const request = { ...baseOptions, backend };
        const mockResponse = 'some response';
        const cliCompletionMock = t.mock.method(
          LlmToolsService.prototype,
          'cliCompletion',
        );
        cliCompletionMock.mock.mockImplementation((_request) => {
          return Promise.resolve(mockResponse);
        });
        const processStdoutMock = t.mock.method(process.stdout, 'write');
        processStdoutMock.mock.mockImplementation(() => true);

        await cliCompletion(request);

        t.assert.strictEqual(cliCompletionMock.mock.callCount(), 1);
        t.assert.ok(processStdoutMock.mock.callCount() >= 1);
        t.assert.notStrictEqual(
          processStdoutMock.mock.calls.find(
            (call) => call.arguments[0] === mockResponse,
          ),
          undefined,
        );
      });
    });
  }
});
