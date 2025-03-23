import { beforeEach, describe, it, mock, TestContext } from 'node:test';
import { HttpClient } from './http-client';
import { notImplemented } from '../../../test/utils/not-implemented';
import { HttpError } from './error';

void describe('HttpClient', async () => {
  let client: HttpClient;
  const fetchMock = mock.method(global, 'fetch');
  fetchMock.mock.mockImplementation(notImplemented);

  beforeEach(() => {
    client = new HttpClient();
  });

  await it('is defined', (t: TestContext) => {
    t.assert.ok(client);
  });

  await describe('post', async () => {
    await it('fetches json data', async (t: TestContext) => {
      const mockJsonData = {
        foo: 'foo',
        bar: 42,
        baz: [{}, true],
      };
      const fetchMock = t.mock.method(global, 'fetch');
      fetchMock.mock.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: async () => Promise.resolve(mockJsonData),
        } as Response);
      });

      const result = await client.post('https://example.com', { a: 'b' });

      t.assert.deepStrictEqual(result, mockJsonData);
      t.assert.strictEqual(fetchMock.mock.callCount(), 1);
      t.assert.strictEqual(
        fetchMock.mock.calls[0].arguments[0],
        'https://example.com',
      );
      t.assert.strictEqual(
        fetchMock.mock.calls[0].arguments[1]?.body,
        JSON.stringify({ a: 'b' }),
      );
      t.assert.strictEqual(fetchMock.mock.calls[0].arguments[1].method, 'POST');
    });

    await it('throws error if response if not OK', async (t: TestContext) => {
      const fetchMock = t.mock.method(global, 'fetch');
      fetchMock.mock.mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: async () => Promise.resolve('some error'),
        } as Response);
      });

      await t.assert.rejects(async () => {
        await client.post('https://example.com', {});
      }, HttpError);

      t.assert.strictEqual(fetchMock.mock.callCount(), 1);
      t.assert.strictEqual(
        fetchMock.mock.calls[0].arguments[0],
        'https://example.com',
      );
      t.assert.strictEqual(
        fetchMock.mock.calls[0].arguments[1]?.body,
        JSON.stringify({}),
      );
      t.assert.strictEqual(fetchMock.mock.calls[0].arguments[1].method, 'POST');
    });
  });

  await describe('postStream', async () => {
    await it('fetches stream data', async (t: TestContext) => {
      const fetchMock = t.mock.method(global, 'fetch');
      fetchMock.mock.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(Buffer.from('foo\nbar', 'utf-8'));
              controller.enqueue(Buffer.from('baz', 'utf-8'));
              controller.close();
            },
          }),
        } as Response);
      });

      const result = client.postStream('https://example.com', { a: 1 });
      let totalResponse = '';
      for await (const responseChunk of result) {
        totalResponse += responseChunk;
      }

      t.assert.strictEqual(totalResponse, 'foo\nbarbaz');
      t.assert.strictEqual(fetchMock.mock.callCount(), 1);
      t.assert.strictEqual(
        fetchMock.mock.calls[0].arguments[0],
        'https://example.com',
      );
      t.assert.strictEqual(
        fetchMock.mock.calls[0].arguments[1]?.body,
        JSON.stringify({ a: 1 }),
      );
      t.assert.strictEqual(fetchMock.mock.calls[0].arguments[1].method, 'POST');
    });

    await it('yields nothing when there is no body', async (t: TestContext) => {
      const fetchMock = t.mock.method(global, 'fetch');
      fetchMock.mock.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          body: null,
        } as Response);
      });

      const result = client.postStream('https://example.com', { a: 1 });
      for await (const _responseChunk of result) {
        t.assert.fail();
      }
    });
  });

  await describe('get', async () => {
    await it('fetches json data', async (t: TestContext) => {
      const mockJsonData = {
        foo: 'foo',
        bar: 42,
        baz: [{}, true],
      };
      const fetchMock = t.mock.method(global, 'fetch');
      fetchMock.mock.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: async () => Promise.resolve(mockJsonData),
        } as Response);
      });

      const result = await client.get('https://example.com');

      t.assert.deepStrictEqual(result, mockJsonData);
      t.assert.strictEqual(fetchMock.mock.callCount(), 1);
      t.assert.strictEqual(
        fetchMock.mock.calls[0].arguments[0],
        'https://example.com',
      );
    });
  });
});
