import { ValidationError } from 'yup';
import { HttpClient, IHttpClient } from '../../infra';
import { ILlmToolsClient } from '../types';
import {
  completionNoStreamResponseSchema,
  completionStreamEndResponseSchema,
  completionStreamResponseSchema,
  infillResponseSchema,
} from './schemas';
import {
  ILlamaCppClientConfig,
  ILlamaCppCompletionNoStreamRequest,
  ILlamaCppCompletionStreamRequest,
  ILlamaCppInfillRequest,
  LlamaCppCompletionNoStreamResponse,
  LlamaCppCompletionStreamEndResponse,
  LlamaCppCompletionStreamResponse,
  LlamaCppInfillResponse,
} from './types';

/**
 * NOTE: llama-server exposes some OpenAI-compatible endpoints that are not
 * implemented here
 * https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md#openai-compatible-api-endpoints
 */
export class LlamaCppClient
  implements
    ILlmToolsClient<
      ILlamaCppInfillRequest,
      LlamaCppInfillResponse,
      ILlamaCppCompletionNoStreamRequest,
      LlamaCppCompletionNoStreamResponse,
      ILlamaCppCompletionStreamRequest,
      LlamaCppCompletionStreamResponse | LlamaCppCompletionStreamEndResponse
    >
{
  private readonly httpClient: IHttpClient;

  constructor(
    private readonly config: ILlamaCppClientConfig,
    httpClient?: IHttpClient,
  ) {
    this.httpClient = httpClient || new HttpClient();
  }

  /** https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md#post-infill-for-code-infilling */
  async infill(
    request: ILlamaCppInfillRequest,
  ): Promise<LlamaCppInfillResponse> {
    const response = await this.httpClient.post(
      `${this.config.serverOrigin}/infill`,
      request,
    );
    return infillResponseSchema.validateSync(response, { stripUnknown: false });
  }

  /** https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md#post-completion-given-a-prompt-it-returns-the-predicted-completion */
  async completion(
    request: ILlamaCppCompletionNoStreamRequest,
  ): Promise<LlamaCppCompletionNoStreamResponse> {
    const response = await this.httpClient.post(
      `${this.config.serverOrigin}/completion`,
      request,
    );
    return completionNoStreamResponseSchema.validateSync(response, {
      stripUnknown: false,
    });
  }

  /** https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md#post-completion-given-a-prompt-it-returns-the-predicted-completion */
  async *completionStream(
    request: ILlamaCppCompletionStreamRequest,
  ): AsyncGenerator<
    LlamaCppCompletionStreamResponse | LlamaCppCompletionStreamEndResponse,
    void,
    unknown
  > {
    const stream = this.httpClient.postStream(
      `${this.config.serverOrigin}/completion`,
      request,
    );
    for await (const responseChunk of stream) {
      const jsonResponseChunk: unknown = JSON.parse(responseChunk);
      try {
        const streamResponse = completionStreamResponseSchema.validateSync(
          jsonResponseChunk,
          {
            stripUnknown: false,
          },
        );
        yield streamResponse;
      } catch (e) {
        if (e instanceof ValidationError) {
          const streamEndResponse =
            completionStreamEndResponseSchema.validateSync(jsonResponseChunk, {
              stripUnknown: false,
            });
          yield streamEndResponse;
        }
      }
    }
  }
}
