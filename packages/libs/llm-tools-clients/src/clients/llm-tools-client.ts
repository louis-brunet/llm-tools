import { LlamaCppService } from './llama-cpp';
import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsService,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
  LlmToolsClientConfig,
} from './types';

export class LlmToolsService implements ILlmToolsService {
  private readonly client: ILlmToolsService;

  constructor(clientConfig: LlmToolsClientConfig) {
    switch (clientConfig.backend) {
      case 'llama-cpp':
        this.client = new LlamaCppService(clientConfig);
        break;
      default:
        throw new Error(`Backend not implemented: ${clientConfig.backend}`);
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
