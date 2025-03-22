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
      LlamaCppCompletionStreamResponse
    >
{
  private readonly httpClient: IHttpClient;

  constructor(
    private readonly config: ILlamaCppClientConfig,
    httpClient?: IHttpClient,
  ) {
    this.httpClient = httpClient || new HttpClient();
  }

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
      const streamResponse = completionStreamResponseSchema.validateSync(
        responseChunk,
        {
          stripUnknown: false,
        },
      );
      if (streamResponse.stop) {
        const streamEndResponse =
          completionStreamEndResponseSchema.validateSync(responseChunk, {
            stripUnknown: false,
          });
        yield streamEndResponse;
      } else {
        yield streamResponse;
      }
    }
  }
}
