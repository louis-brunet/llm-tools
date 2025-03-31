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
    responses: {
      infill: {
        content: 'some-infill-content',
        tokens_predicted: 42,
      } satisfies LlamaCppInfillResponse,
      cliCompletion: {
        content: 'some-cli-completion-content',
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
      } satisfies LlamaCppCompletionResponse,
    },
    expected: {
      infill: 'some-infill-content',
      cliCompletion: 'some-cli-completion-content',
    },
  },
  [LlmToolsBackendEnum.OLLAMA]: {
    endpoints: {
      infill: '/api/generate',
      cliCompletion: '/api/generate',
    },
    responses: {
      infill: {
        response: 'some-infill-response',
      },
      cliCompletion: {
        response: 'some-cli-completion-response',
      },
    },
    expected: {
      infill: 'some-infill-response',
      cliCompletion: 'some-cli-completion-response',
    },
  },
} as const satisfies Record<
  LlmToolsBackendEnum,
  {
    endpoints: { infill: string; cliCompletion: string };
    responses: { infill: unknown; cliCompletion: unknown };
    expected: { infill: string; cliCompletion: string };
  }
>;

describe('cli (e2e)', () => {
  for (const [backend, { endpoints, responses, expected }] of Object.entries(
    backendToTest,
  )) {
    describe(`with backend ${backend}`, () => {
      describe(`command infill`, () => {
        it('prints result to stdout with all optional aguments', async (t: TestContext) => {
          const mockInfillResponse = responses.infill;
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
            expected.infill,
          );
        });
      });

      describe('command cli-completion', () => {
        it('prints result to stdout with all optional aguments', async (t: TestContext) => {
          const mockCliCompletionResponse = responses.cliCompletion;
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
            expected.cliCompletion,
          );
        });
      });
    });
  }
});
