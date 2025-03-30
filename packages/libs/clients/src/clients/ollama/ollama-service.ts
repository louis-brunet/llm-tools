import { IModelAdapter, Qwen25CoderAdapter } from '../../models';
import { NotImplementedError } from '../../utils';
import type {
  ILlmToolsCliCompletionRequest,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
  ILlmToolsService,
} from '../types';
import { OllamaClient } from './ollama-client';
import { ILlmToolsOllamaConfig } from './types';

export class OllamaService implements ILlmToolsService {
  private readonly client: OllamaClient;

  private _modelAdapter?: IModelAdapter;
  private get modelAdapter(): IModelAdapter {
    return (this._modelAdapter ??= this.createModelAdapter(this.config.model));
  }

  constructor(private readonly config: ILlmToolsOllamaConfig) {
    this.client = new OllamaClient(config);
  }

  async infill(
    request: ILlmToolsInfillRequest,
  ): Promise<ILlmToolsInfillResponse> {
    const prompt = this.modelAdapter.createInfillPrompt({
      ...request,
      repoName: 'current-project',
      currentFileName: 'current-file',
    });
    const result = await this.client.generate({
      model: this.config.model,
      prompt,
      raw: true,
      suffix: request.inputSuffix,
    });
    return { content: result.response };
  }

  cliCompletion(_request: ILlmToolsCliCompletionRequest): Promise<string> {
    throw new NotImplementedError(this.cliCompletion.name);
  }

  private createModelAdapter(model: string): IModelAdapter {
    if (model.includes('qwen2.5-coder')) {
      return new Qwen25CoderAdapter();
    } else {
      throw new NotImplementedError(`no model adapter for ${model}`);
    }
  }
}
