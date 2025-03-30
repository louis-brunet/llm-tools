/* eslint-disable @typescript-eslint/no-floating-promises */

import { beforeEach, describe, it, TestContext } from 'node:test';
import { LlmToolsService } from './llm-tools-service';
import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsInfillRequest,
  ILlmToolsService,
  LlmToolsBackendEnum,
  LlmToolsServiceConfig,
} from './types';
import { LlamaCppModelEnum, LlamaCppService } from './llama-cpp';
import { OllamaService } from './ollama';

interface ILlmToolsServiceClass<TBackendConfig extends LlmToolsServiceConfig> {
  new (config: TBackendConfig): ILlmToolsService;
}

const configForBackend = {
  [LlmToolsBackendEnum.LLAMA_CPP]: {
    backend: LlmToolsBackendEnum.LLAMA_CPP,
    serverOrigin: 'some-server-origin',
    models: [LlamaCppModelEnum.QWEN_2_5_CODER],
    // model: LlamaCppModelEnum.QWEN_2_5_CODER,
  },
  [LlmToolsBackendEnum.OLLAMA]: {
    backend: LlmToolsBackendEnum.OLLAMA,
    serverOrigin: 'some-server-origin',
    models: ['qwen2.5-coder', 'some-model'],
    // model: 'some-model',
  },
} as const satisfies Record<
  LlmToolsBackendEnum,
  // LlmToolsServiceConfig
  Omit<LlmToolsServiceConfig, 'model'> & {
    models: Array<LlmToolsServiceConfig['model']>;
  }
>;

const serviceForBackend = {
  [LlmToolsBackendEnum.LLAMA_CPP]: LlamaCppService,
  [LlmToolsBackendEnum.OLLAMA]: OllamaService,
} as const satisfies {
  [TBackend in LlmToolsBackendEnum]: ILlmToolsServiceClass<
    LlmToolsServiceConfig & { backend: TBackend }
  >;
};

const backendsToTest = Object.values(LlmToolsBackendEnum).map(
  (backend) =>
    ({
      backend,
      config: configForBackend[backend],
      serviceClass: serviceForBackend[backend],
    }) as const,
);

describe('LlmToolsService (unit)', () => {
  for (const { backend, config, serviceClass } of backendsToTest) {
    for (const model of config.models) {
      const configWithModel = { ...config, model };
      // delete (configWithModel as { models?: unknown }).models;
      describe(`with backend ${backend}`, () => {
        let service: ILlmToolsService;

        beforeEach(() => {
          service = new LlmToolsService(
            configWithModel as LlmToolsServiceConfig,
          );
          // service = new LlmToolsService(config as LlmToolsServiceConfig);
        });

        describe('infill', () => {
          it('calls backend-specific service', async (t: TestContext) => {
            const backendServiceClass = serviceClass;
            const mockReponse = {
              content: 'hi',
              tokensPredicted: 1,
            };
            const infillMock = t.mock.method(
              backendServiceClass.prototype,
              'infill',
            );
            infillMock.mock.mockImplementation((_request) =>
              Promise.resolve(mockReponse),
            );
            const request: ILlmToolsInfillRequest = {
              inputPrefix: 'some-prefix',
              inputSuffix: 'some-suffix',
              prompt: 'some-prompt',
              inputExtra: [{ fileName: 'filename', text: 'file content' }],
              singleLine: false,
            };

            const result = await service.infill(request);

            t.assert.deepStrictEqual(result, mockReponse);
            t.assert.strictEqual(infillMock.mock.callCount(), 1);
            t.assert.deepStrictEqual(
              infillMock.mock.calls[0].arguments[0],
              request,
            );
          });
        });

        describe('cliCompletion', () => {
          it('calls backend-specific service', async (t: TestContext) => {
            const backendServiceClass = serviceClass;
            const mockReponse = 'MOCKED RESPONSE';
            const cliCompletionMock = t.mock.method(
              backendServiceClass.prototype,
              'cliCompletion',
            );
            cliCompletionMock.mock.mockImplementation((_request) =>
              Promise.resolve(mockReponse),
            );
            const request: ILlmToolsCliCompletionRequest = {
              history: [{ command: 'some-history-command' }],
              matchedHistory: [{ command: 'some-matched-history-command' }],
              project: {
                path: 'some-path',
                files: ['some-file1', 'some-file2'],
              },
              promptPrefix: 'some-prefix',
              promptSuffix: 'some-suffix',
              shell: 'some-shell',
            };

            const result = await service.cliCompletion(request);

            t.assert.deepStrictEqual(result, mockReponse);
            t.assert.strictEqual(cliCompletionMock.mock.callCount(), 1);
            t.assert.deepStrictEqual(
              cliCompletionMock.mock.calls[0].arguments[0],
              request,
            );
          });
        });
      });
    }
  }
});
