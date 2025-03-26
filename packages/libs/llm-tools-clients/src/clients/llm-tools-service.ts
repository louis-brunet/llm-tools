import { LlamaCppService } from './llama-cpp';
import { OllamaService } from './ollama';
import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsService,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
  LlmToolsServiceConfig,
  LlmToolsBackendEnum,
} from './types';

export class LlmToolsService implements ILlmToolsService {
  private readonly client: ILlmToolsService;

  constructor(backendConfig: LlmToolsServiceConfig) {
    switch (backendConfig.backend) {
      case LlmToolsBackendEnum.LLAMA_CPP:
        this.client = new LlamaCppService(backendConfig);
        break;
      case LlmToolsBackendEnum.OLLAMA:
        this.client = new OllamaService(backendConfig);
        break;
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
