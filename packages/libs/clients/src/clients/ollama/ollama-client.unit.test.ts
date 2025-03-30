/* eslint-disable @typescript-eslint/no-floating-promises */
import { beforeEach, describe, it, TestContext } from 'node:test';
import { OllamaClient } from './ollama-client';
import { GenerateRequest, GenerateResponse, Ollama } from 'ollama';

const modelsToTest = ['qwen2.5-coder', 'some-model'];

describe('OllamaClient (unit)', () => {
  for (const model of modelsToTest) {
    describe(`with model '${model}'`, () => {
      let client: OllamaClient;

      beforeEach(() => {
        client = new OllamaClient({
          serverOrigin: 'some-server-origin',
          model,
        });
      });

      it('is defined', (t: TestContext) => {
        t.assert.ok(client);
      });

      describe('generate', () => {
        it('calls library with given inputs and with no streaming', async (t: TestContext) => {
          const mockGenerateResponse: Partial<GenerateResponse> = {
            response: 'some response',
          };
          const generateMock = t.mock.method(Ollama.prototype, 'generate', () =>
            Promise.resolve(mockGenerateResponse),
          );

          const response = await client.generate({
            model,
            prompt: 'some prompt',
            suffix: 'some suffix',
          });

          t.assert.deepStrictEqual(response, mockGenerateResponse);
          t.assert.ok(generateMock.mock.callCount() >= 1);
          // TODO: make a new library with test helpers from the cli's test utils
          //  (calledWith, calledWithPartial, etc.)
          t.assert.partialDeepStrictEqual(
            generateMock.mock.calls[0].arguments[0],
            {
              model,
              prompt: 'some prompt',
              suffix: 'some suffix',
              stream: false,
            } satisfies GenerateRequest,
          );
        });
      });

      describe('generateStream', () => {
        it('calls library with given inputs and with streaming', async (t: TestContext) => {
          const mockGenerateResponse: Partial<GenerateResponse> = {
            response: 'some response',
          };
          const generateMock = t.mock.method(
            Ollama.prototype,
            'generate',
            // eslint-disable-next-line @typescript-eslint/require-await
            async function* () {
              yield mockGenerateResponse;
            },
          );

          const response = await client.generateStream({
            model,
            prompt: 'some prompt',
            suffix: 'some suffix',
          });
          for await (const chunk of response) {
            t.assert.deepStrictEqual(chunk, mockGenerateResponse);
          }

          t.assert.ok(generateMock.mock.callCount() >= 1);
          // TODO: make a new library with test helpers from the cli's test utils
          //  (calledWith, calledWithPartial, etc.)
          t.assert.partialDeepStrictEqual(
            generateMock.mock.calls[0].arguments[0],
            {
              model,
              prompt: 'some prompt',
              suffix: 'some suffix',
              stream: true,
            } satisfies GenerateRequest,
          );
        });
      });
    });
  }
});
