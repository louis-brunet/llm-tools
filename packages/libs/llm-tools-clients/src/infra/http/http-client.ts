import {
  completionStreamEndResponseSchema,
  completionStreamResponseSchema,
} from '../../clients/llama-cpp/schemas';
import { HttpError } from './error';

export interface IHttpClient {
  get(url: string): unknown;
  post(
    url: string,
    data: object,
    options?: { headers?: Record<string, string> },
  ): unknown;
  postStream(
    url: string,
    data: object,
    options?: { headers?: Record<string, string> },
  ): AsyncGenerator<string, void, unknown>;
}

// async function fetchTextAsStream(url: string) {
//   try {
//     const response = await fetch(url);
//     // if (!response.ok) {
//     //   throw new Error(`Response status: ${response.status}`);
//     // }
//
//     if (response.body) {
//       // const stream = response.body
//       // const stream: NodeJS.ReadableStream = response.body
//       // .pipeThrough(
//       //   new TextDecoderStream(),
//       // );
//       // const stream = response.body.pipeThrough(new TextDecoderStream());
//       const stream = response.body;
//       for await (const value of stream) {
//         console.log(value);
//       }
//     }
//   } catch (e) {
//     console.error(e);
//   }
// }

export class HttpClient implements IHttpClient {
  async get(url: string): Promise<unknown> {
    const response = await fetch(url);
    return await response.json();
  }

  async post(
    url: string,
    data: object,
    options?: { headers?: Record<string, string> },
  ): Promise<unknown> {
    const response = await this._post(url, data, options);
    return await response.json();
  }

  async *postStream(
    url: string,
    data: object,
    options?: { headers?: Record<string, string> },
  ): AsyncGenerator<string, void, unknown> {
    const response = await this._post(url, data, options);
    if (response.body) {
      const stream = response.body.pipeThrough(new TextDecoderStream('utf-8'));
      for await (const responseChunk of stream) {
        yield responseChunk;
      }
    }
  }

  private async _post(
    url: string,
    data: object,
    options?: { headers?: Record<string, string> },
  ): Promise<Response> {
    const response = await fetch(url, {
      method: 'POST',
      headers: options?.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new HttpError(response, await response.text());
    }
    return response;
  }
}
