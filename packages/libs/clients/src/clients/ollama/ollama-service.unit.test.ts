/* eslint-disable @typescript-eslint/no-floating-promises */
import { beforeEach, describe, it, TestContext } from 'node:test';
import { GenerateRequest, GenerateResponse } from 'ollama';
import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
} from '../types';
import { OllamaService } from './ollama-service';
import { OllamaClient } from './ollama-client';

const modelsToTest = [
  'qwen2.5-coder',
  // 'some-model',
];

describe('OllamaService (unit)', () => {
  for (const model of modelsToTest) {
    describe(`with model '${model}'`, () => {
      let service: OllamaService;
      const mockGenerateResponse: GenerateResponse = {
        context: [],
        created_at: new Date(),
        done: true,
        done_reason: '',
        eval_count: 1,
        eval_duration: 1,
        load_duration: 1,
        model,
        prompt_eval_count: 1,
        prompt_eval_duration: 1,
        response: 'some-response',
        total_duration: 1,
      } as const;

      beforeEach(() => {
        service = new OllamaService({
          serverOrigin: 'some-server-origin',
          model,
        });
      });

      it('is defined', (t: TestContext) => {
        t.assert.ok(service);
      });

      describe('infill', () => {
        it('calls the client infill method', async (t: TestContext) => {
          const infillRequest: ILlmToolsInfillRequest = {
            inputPrefix: 'input_prefix',
            inputSuffix: 'input_suffix',
            prompt: 'prompt',
            inputExtra: [
              { fileName: 'file1', text: 'text1' },
              { fileName: 'file2', text: 'text2' },
            ],
          };
          const infillResponse: GenerateResponse = mockGenerateResponse;
          const mappedInfillResponse: ILlmToolsInfillResponse = {
            content: infillResponse.response,
          };
          const generateMock = t.mock.method(
            OllamaClient.prototype,
            'generate',
            (_request: GenerateRequest): Promise<GenerateResponse> =>
              Promise.resolve(infillResponse),
          );

          const result = await service.infill(infillRequest);

          t.assert.deepStrictEqual(result, mappedInfillResponse);
          t.assert.strictEqual(generateMock.mock.callCount(), 1);
        });
      });

      describe('cliCompletion', () => {
        it('calls the client completion method', async (t: TestContext) => {
          const cliCompletionRequest: ILlmToolsCliCompletionRequest = {
            promptPrefix: 'input_prefix',
            promptSuffix: 'input_suffix',
            shell: 'shell',
            history: [
              { command: 'history command1' },
              { command: 'history command2' },
            ],
            matchedHistory: [
              { command: 'matched command1' },
              { command: 'matched command2' },
            ],
            project: {
              path: 'path',
              files: ['some-file.ts'],
            },
          };
          const clientCompletionResponse: GenerateResponse =
            mockGenerateResponse;
          const cliCompletionResponse: string = 'cliCompletionResponse';

          const generateMock = t.mock.method(
            OllamaClient.prototype,
            'generate',
            (_request: GenerateRequest): Promise<GenerateResponse> =>
              Promise.resolve(clientCompletionResponse),
          );

          const result = await service.cliCompletion(cliCompletionRequest);

          t.assert.deepStrictEqual(result, cliCompletionResponse);
          t.assert.strictEqual(generateMock.mock.callCount(), 1);

          // const cliCompletionSpy = t.mock.method(
          //   OllamaClient.prototype,
          //   'generate',
          //   (): Promise<LlamaCppCompletionResponse> =>
          //     Promise.resolve(clientCompletionResponse),
          // );
          //
          // const result = await service.cliCompletion(cliCompletionRequest);
          //
          // t.assert.deepStrictEqual(result, cliCompletionResponse);
          // t.assert.strictEqual(cliCompletionSpy.mock.callCount(), 1);

          const completionArguments = generateMock.mock.calls[0].arguments[0];
          t.assert.ok(completionArguments);
          const completionPrompt = completionArguments.prompt;
          t.assert.ok(typeof completionPrompt === 'string');
          t.assert.ok(
            generateMock.mock.calls[0].arguments[0].options?.stop?.includes(
              '\n',
            ),
          );
          t.assert.ok(
            generateMock.mock.calls[0].arguments[0].options?.stop?.includes(
              cliCompletionRequest.promptSuffix,
            ),
          );
          for (const matchingString of [
            ...cliCompletionRequest.history.map((h) => h.command),
            ...cliCompletionRequest.matchedHistory.map((h) => h.command),
            ...cliCompletionRequest.project.files,
            cliCompletionRequest.shell,
          ]) {
            t.assert.match(completionPrompt, new RegExp(matchingString));
          }
        });
      });
    });
  }
});
