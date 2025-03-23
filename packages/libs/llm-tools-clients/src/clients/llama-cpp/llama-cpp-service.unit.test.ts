import { beforeEach, describe, it, TestContext } from 'node:test';
import { LlamaCppService } from './llama-cpp-service';
import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
} from '../types';
import { LlamaCppClient } from './llama-cpp-client';
import { LlamaCppCompletionResponse, LlamaCppInfillResponse } from './types';

void describe('LlamaCppService', async () => {
  let service: LlamaCppService;
  beforeEach(() => {
    service = new LlamaCppService({
      backend: 'llama-cpp',
      serverOrigin: 'some-server-origin',
    });
  });

  await it('is defined', (t: TestContext) => {
    t.assert.ok(service);
  });

  await describe('infill', async () => {
    await it('calls the client infill method', async (t: TestContext) => {
      const infillRequest: ILlmToolsInfillRequest = {
        inputPrefix: 'input_prefix',
        inputSuffix: 'input_suffix',
        prompt: 'prompt',
        inputExtra: [
          { fileName: 'file1', text: 'text1' },
          { fileName: 'file2', text: 'text2' },
        ],
      };
      const infillResponse: LlamaCppInfillResponse = {
        content: 'content',
        tokens_predicted: 42,
      };
      const mappedInfillResponse: ILlmToolsInfillResponse = {
        content: 'content',
        tokensPredicted: 42,
      };
      const infillSpy = t.mock.method(
        LlamaCppClient.prototype,
        'infill',
        (): Promise<LlamaCppInfillResponse> => Promise.resolve(infillResponse),
      );
      const result = await service.infill(infillRequest);
      t.assert.deepStrictEqual(result, mappedInfillResponse);
      t.assert.strictEqual(infillSpy.mock.callCount(), 1);
    });
  });

  await describe('cliCompletion', async () => {
    await it('calls the client completion method', async (t: TestContext) => {
      const cliCompletionRequest: ILlmToolsCliCompletionRequest = {
        promptPrefix: 'input_prefix',
        promptSuffix: 'input_suffix',
        shell: 'shell',
        history: [
          { command: 'history command1' },
          { command: 'history command2' },
        ],
        project: {
          path: 'path',
          files: ['some-file.ts'],
        },
      };
      const clientCompletionResponse: LlamaCppCompletionResponse = {
        content: 'cliCompletionResponse',
      } as LlamaCppCompletionResponse;
      const cliCompletionResponse: string = 'cliCompletionResponse';
      const cliCompletionSpy = t.mock.method(
        LlamaCppClient.prototype,
        'completion',
        (): Promise<LlamaCppCompletionResponse> =>
          Promise.resolve(clientCompletionResponse),
      );

      const result = await service.cliCompletion(cliCompletionRequest);

      t.assert.deepStrictEqual(result, cliCompletionResponse);
      t.assert.strictEqual(cliCompletionSpy.mock.callCount(), 1);
      const completionArguments = cliCompletionSpy.mock.calls[0].arguments[0];
      t.assert.ok(completionArguments);
      const completionPrompt = completionArguments.prompt;
      t.assert.ok(typeof completionPrompt === 'string');
      t.assert.ok(
        cliCompletionSpy.mock.calls[0].arguments[0]?.stop?.includes('\n'),
      );
      t.assert.ok(
        cliCompletionSpy.mock.calls[0].arguments[0]?.stop?.includes(
          cliCompletionRequest.promptSuffix,
        ),
      );
      t.assert.match(completionPrompt, new RegExp(cliCompletionRequest.shell));
      for (const historyCommand of cliCompletionRequest.history) {
        t.assert.match(completionPrompt, new RegExp(historyCommand.command));
      }
      for (const projectFile of cliCompletionRequest.project.files) {
        t.assert.match(completionPrompt, new RegExp(projectFile));
      }
    });
  });
});
