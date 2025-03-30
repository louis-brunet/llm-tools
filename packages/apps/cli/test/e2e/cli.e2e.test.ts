/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  LlamaCppCompletionResponse,
  LlamaCppInfillResponse,
  LlmToolsBackendEnum,
} from '@llm-tools/clients';
import { describe, it, TestContext } from 'node:test';
import { runCli } from '../../src/cli';

function createMockResponse(body: object): Response {
  return {
    ok: true,
    headers: new Headers({
      'some-header-name': 'header-value',
    }),
    status: 200,
    statusText: 'OK',
    json() {
      return Promise.resolve(body);
    },
    text() {
      return Promise.resolve(JSON.stringify(body));
    },
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(Buffer.from(JSON.stringify(body)));
        controller.close();
      },
    }),
  } as Response;
}

function createArgv(
  command: string,
  options: Record<string, string>,
  arrayOptions: Record<string, string[]>,
) {
  return [
    'node',
    'cli.js',
    command,
    ...Object.entries(options).map(([key, value]) => `--${key}=${value}`),
    ...Object.entries(arrayOptions).flatMap(([key, value]) => [
      `--${key}`,
      ...value,
    ]),
  ];
}

const backendToTest = {
  [LlmToolsBackendEnum.LLAMA_CPP]: {
    endpoints: {
      infill: '/infill',
      cliCompletion: '/completion',
    },
  },
  [LlmToolsBackendEnum.OLLAMA]: {
    endpoints: {
      infill: '/infill',
      cliCompletion: '/completion',
    },
  },
} as const satisfies Record<
  LlmToolsBackendEnum,
  { endpoints: { infill: string; cliCompletion: string } }
>;

describe('cli (e2e)', () => {
  for (const [backend, { endpoints }] of Object.entries(backendToTest)) {
    describe(`with backend ${backend}`, () => {
      describe(`command infill`, () => {
        it('prints result to stdout with all optional aguments', async (t: TestContext) => {
          const mockInfillResponse: LlamaCppInfillResponse = {
            content: 'some-content',
            tokens_predicted: 42,
          };
          const fetchMock = t.mock.method(global, 'fetch');
          fetchMock.mock.mockImplementation(() =>
            Promise.resolve(createMockResponse(mockInfillResponse)),
          );
          const stdoutWriteMock = t.mock.method(process.stdout, 'write');
          stdoutWriteMock.mock.mockImplementation(() => true);

          const infillOptions = {
            server: 'http://localhost:12345',
            prefix: 'some-prefix',
            suffix: 'some-suffix',
            prompt: 'some-prompt',
            backend,
          };
          const infillArrayOptions = {
            extra: ['file1:content1', 'file2:content2'],
          };
          process.argv = createArgv(
            'infill',
            infillOptions,
            infillArrayOptions,
          );

          const parsedProgram = await runCli();

          t.assert.ok(parsedProgram);
          t.assert.strictEqual(fetchMock.mock.callCount(), 1);
          t.assert.strictEqual(
            fetchMock.mock.calls[0].arguments[0],
            `${infillOptions.server}${endpoints.infill}`,
          );

          t.assert.strictEqual(stdoutWriteMock.mock.callCount(), 1);
          t.assert.strictEqual(
            stdoutWriteMock.mock.calls[0].arguments[0],
            mockInfillResponse.content,
          );
        });
      });

      describe('command cli-completion', () => {
        it('prints result to stdout with all optional aguments', async (t: TestContext) => {
          const mockCliCompletionResponse: LlamaCppCompletionResponse = {
            content: 'some-content',
            generation_settings: {},
            model: 'some-model',
            prompt: 'some-prompt',
            stop: true,
            stop_type: 'eos',
            stopping_word: '',
            timings: {},
            tokens: [],
            tokens_cached: 0,
            tokens_evaluated: 42,
            truncated: false,
          };
          const fetchMock = t.mock.method(global, 'fetch');
          fetchMock.mock.mockImplementation(() =>
            Promise.resolve(createMockResponse(mockCliCompletionResponse)),
          );
          const stdoutWriteMock = t.mock.method(process.stdout, 'write');
          stdoutWriteMock.mock.mockImplementation(() => true);

          const options = {
            server: 'http://localhost:12345',
            prefix: 'some-prefix',
            suffix: 'some-suffix',
            backend,
            shell: 'some-shell',
            'working-directory': 'some-working-dir',
          };
          const arrayOptions = {
            'recent-history': ['recent-history1', 'recent-history2'],
            'matched-history': ['matched-history1', 'matched-history2'],
            files: ['file1', 'file2'],
          };
          process.argv = createArgv('cli-completion', options, arrayOptions);

          const parsedProgram = await runCli();

          t.assert.ok(parsedProgram);
          t.assert.strictEqual(fetchMock.mock.callCount(), 1);
          t.assert.strictEqual(
            fetchMock.mock.calls[0].arguments[0],
            `${options.server}${endpoints.cliCompletion}`,
          );

          t.assert.strictEqual(stdoutWriteMock.mock.callCount(), 1);
          t.assert.strictEqual(
            stdoutWriteMock.mock.calls[0].arguments[0],
            mockCliCompletionResponse.content,
          );
        });
      });
    });
  }
});
