import { beforeEach, describe, it, TestContext } from 'node:test';
import { ValidationError } from 'yup';
import { IHttpClient } from '../../infra';
import { LlamaCppClient } from './llama-cpp-client';
import {
  ILlamaCppClientConfig,
  LlamaCppCompletionResponse,
  LlamaCppInfillResponse,
} from './types';
import { notImplemented } from '../../../test/utils/not-implemented';

void describe('LlamaCppClient', async () => {
  let client: LlamaCppClient;
  const mockLlamaConfig: ILlamaCppClientConfig = {
    serverOrigin: 'some-server-origin',
  };
  const mockHttpClient: IHttpClient = {
    get: notImplemented,
    post: notImplemented,
    postStream: async function* (): ReturnType<IHttpClient['postStream']> {
      await notImplemented();
      yield '';
    },
  } as const;
  const validCompletionResponse: LlamaCppCompletionResponse = {
    content: 'foo',
    prompt: '',
    generation_settings: {},
    model: 'some-model',
    stop: true,
    stop_type: 'eos',
    stopping_word: '',
    timings: {},
    tokens: [],
    tokens_cached: 0,
    tokens_evaluated: 0,
    truncated: false,
  } as const;

  beforeEach((t) => {
    client = new LlamaCppClient(mockLlamaConfig, mockHttpClient);
  });

  await it('is defined', (t: TestContext) => {
    t.assert.ok(client);
  });

  await describe('infill', async () => {
    await it('calls http client', async (t: TestContext) => {
      const validInfillResponse: LlamaCppInfillResponse = {
        tokens_predicted: 42,
        content: 'foo',
      };

      const postMock = t.mock.method(mockHttpClient, 'post');
      postMock.mock.mockImplementation(() => {
        return Promise.resolve(validInfillResponse);
      });

      const result = await client.infill({
        prompt: '',
        input_prefix: '',
        input_suffix: '',
      });

      t.assert.strictEqual(typeof result.content, 'string');
      t.assert.deepStrictEqual(result, validInfillResponse);
      t.assert.strictEqual(postMock.mock.callCount(), 1);
      t.assert.ok(
        postMock.mock.calls[0].arguments[0].includes(
          mockLlamaConfig.serverOrigin + '/infill',
        ),
      );
    });

    await it('validates response', async (t: TestContext) => {
      const invalidInfillResponse = {
        foo: 'foo',
      };

      const postMock = t.mock.method(mockHttpClient, 'post');
      postMock.mock.mockImplementation(() => {
        return Promise.resolve(invalidInfillResponse);
      });

      await t.assert.rejects(
        () =>
          client.infill({
            prompt: '',
            input_prefix: '',
            input_suffix: '',
          }),
        ValidationError,
      );
      t.assert.strictEqual(postMock.mock.callCount(), 1);
    });
  });

  await describe('completion', async () => {
    await it('calls http client', async (t: TestContext) => {
      const postMock = t.mock.method(mockHttpClient, 'post');
      postMock.mock.mockImplementation(() => {
        return Promise.resolve(validCompletionResponse);
      });

      const result = await client.completion({
        prompt: '',
      });

      t.assert.strictEqual(typeof result.content, 'string');
      t.assert.deepStrictEqual(result, validCompletionResponse);
      t.assert.strictEqual(postMock.mock.callCount(), 1);
      t.assert.ok(
        postMock.mock.calls[0].arguments[0].includes(
          mockLlamaConfig.serverOrigin + '/completion',
        ),
      );
    });

    await it('validates response', async (t: TestContext) => {
      const invalidCompletionResponse = {
        foo: 'foo',
      };

      const postMock = t.mock.method(mockHttpClient, 'post');
      postMock.mock.mockImplementation(() => {
        return Promise.resolve(invalidCompletionResponse);
      });

      await t.assert.rejects(
        () =>
          client.completion({
            prompt: 'foo',
          }),
        ValidationError,
      );
      t.assert.strictEqual(postMock.mock.callCount(), 1);
    });
  });

  await describe('completionStream', async () => {
    await it('calls http client', async (t: TestContext) => {
      const postMock = t.mock.method(mockHttpClient, 'postStream');

      postMock.mock.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/require-await
        async function* (): AsyncGenerator<string> {
          yield JSON.stringify({ content: 'str', stop: false, tokens: [] });
          yield JSON.stringify({ content: 'aw', stop: false, tokens: [] });
          yield JSON.stringify({
            ...validCompletionResponse,
            content: 'berry',
            stop: true,
          });
        },
      );

      const result = client.completionStream({
        stream: true,
        prompt: '',
      });
      let totalResponse = '';
      for await (const responseChunk of result) {
        totalResponse += responseChunk.content;
        t.assert.ok(responseChunk);
        t.assert.ok(typeof responseChunk.content === 'string');
      }

      t.assert.strictEqual(totalResponse, 'strawberry');
      t.assert.strictEqual(postMock.mock.callCount(), 1);
      t.assert.ok(
        postMock.mock.calls[0].arguments[0].includes(
          mockLlamaConfig.serverOrigin + '/completion',
        ),
      );
    });

    await it('validates stream response', async (t: TestContext) => {
      const invalidCompletionResponse = {
        foo: 'foo',
        stop: false,
      };

      const postMock = t.mock.method(mockHttpClient, 'postStream');
      postMock.mock.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/require-await
        async function* (): AsyncGenerator<string> {
          yield JSON.stringify(invalidCompletionResponse);
        },
      );

      await t.assert.rejects(async () => {
        const response = client.completionStream({
          prompt: 'some-prompt?',
          stream: true,
        });
        for await (const _chunk of response);
      }, ValidationError);
      t.assert.strictEqual(postMock.mock.callCount(), 1);
    });

    await it('validates stream end response', async (t: TestContext) => {
      const invalidCompletionResponse = {
        foo: 'foo',
        stop: true,
      };

      const postMock = t.mock.method(mockHttpClient, 'postStream');
      postMock.mock.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/require-await
        async function* (): AsyncGenerator<string> {
          yield JSON.stringify({ content: 'hello', stop: false, tokens: [] });
          yield JSON.stringify(invalidCompletionResponse);
        },
      );

      await t.assert.rejects(async () => {
        const response = client.completionStream({
          prompt: 'some-prompt?',
          stream: true,
        });
        for await (const _chunk of response);
      }, ValidationError);
      t.assert.strictEqual(postMock.mock.callCount(), 1);
    });
  });
});
