import { LlamaCppClientAdapter } from './llama-cpp';
import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsClientAdapter,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
  LlmToolsClientConfig,
} from './types';

export class LlmToolsClient implements ILlmToolsClientAdapter {
  private readonly client: ILlmToolsClientAdapter;

  constructor(clientConfig: LlmToolsClientConfig) {
    switch (clientConfig.type) {
      case 'llama-cpp':
        this.client = new LlamaCppClientAdapter(clientConfig);
        break;
      default:
        throw new Error(`Unsupported client type: ${clientConfig.type}`);
    }
  }

  async infill(
    request: ILlmToolsInfillRequest,
  ): Promise<ILlmToolsInfillResponse> {
    return await this.client.infill(request);
  }

  async cliCompletion(request: ILlmToolsCliCompletionRequest): Promise<string> {
    return await this.client.cliCompletion(request);
  }
}
