import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsClient,
  ILlmToolsClientAdapter,
  ILlmToolsClientMapper,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
} from './types';

export abstract class LlmToolsClientAdapter<
    IInfillRequest,
    IInfillResponse,
    ICompletionRequest,
    ICompletionResponse,
    ICompletionStreamRequest,
    ICompletionStreamResponse,
  >
  implements
    ILlmToolsClientAdapter,
    ILlmToolsClientMapper<
      IInfillRequest,
      IInfillResponse,
      ICompletionRequest,
      ICompletionResponse
    >
{
  constructor(
    private readonly client: ILlmToolsClient<
      IInfillRequest,
      IInfillResponse,
      ICompletionRequest,
      ICompletionResponse,
      ICompletionStreamRequest,
      ICompletionStreamResponse
    >,
  ) {}

  abstract mapCliCompletionRequest(
    request: ILlmToolsCliCompletionRequest,
  ): ICompletionRequest;
  abstract mapCliCompletionResponse(response: ICompletionResponse): string;

  abstract mapInfillRequest(request: ILlmToolsInfillRequest): IInfillRequest;
  abstract mapInfillResponse(
    response: IInfillResponse,
  ): ILlmToolsInfillResponse;

  public async infill(
    request: ILlmToolsInfillRequest,
  ): Promise<ILlmToolsInfillResponse> {
    const response = await this.client.infill(this.mapInfillRequest(request));
    return this.mapInfillResponse(response);
  }

  public async cliCompletion(
    request: ILlmToolsCliCompletionRequest,
  ): Promise<string> {
    const mappedRequest = this.mapCliCompletionRequest(request);
    console.debug({ mappedRequest });
    const response = await this.client.completion(mappedRequest);
    console.debug({ response });
    return this.mapCliCompletionResponse(response);
  }
}
