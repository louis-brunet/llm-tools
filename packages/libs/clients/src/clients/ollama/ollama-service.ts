import { GenerateResponse } from 'ollama';
import { IModelAdapter, Qwen25CoderAdapter } from '../../models';
import { NotImplementedError } from '../../utils';
import type {
  ILlmToolsCliCompletionRequest,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
  ILlmToolsService,
} from '../types';
import { OllamaClient } from './ollama-client';
import { IOllamaClientConfig } from './types';

interface IOllamaManualInfillRequest extends ILlmToolsInfillRequest {
  system?: string | undefined;
  repoName: string;
  currentFileName: string;
}

export class OllamaService implements ILlmToolsService {
  private readonly client: OllamaClient;

  private _modelAdapter?: IModelAdapter;
  private get modelAdapter(): IModelAdapter {
    return (this._modelAdapter ??= this.createModelAdapter(this.config.model));
  }

  constructor(private readonly config: IOllamaClientConfig) {
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

  async cliCompletion(request: ILlmToolsCliCompletionRequest): Promise<string> {
    const response = await this.manualInfill({
      repoName: request.project.path,
      currentFileName: `command-to-complete.${request.shell}`,
      inputPrefix: request.promptPrefix,
      inputSuffix: request.promptSuffix,
      prompt: '',
      system: `You must complete the current command line using valid ${request.shell} syntax. The command should be a single line.`,
      singleLine: true,
      inputExtra: [
        ...request.project.files.map((file) => ({ fileName: file, text: '' })),
        {
          fileName: '.histfile',
          text: [...request.matchedHistory, ...request.history].reduce(
            (previous, historyItem) => `${previous}${historyItem.command}\n`,
            '',
          ),
        },
      ],
    });
    return response.response;
  }

  private async manualInfill(
    request: IOllamaManualInfillRequest,
  ): Promise<GenerateResponse> {
    const prompt = this.modelAdapter.createInfillPrompt(request);

    const stop: string[] = [];
    if (request.singleLine) {
      stop.push('\n');
    }
    if (request.inputSuffix.trim()) {
      stop.push(request.inputSuffix);
    }

    const response = await this.client.generate({
      prompt,
      model: this.config.model,
      options: {
        stop,
        temperature: 0.2,
        // top_p: 0.6,
        // top_k: ,
      },
    });
    return response;
  }

  private createModelAdapter(model: string): IModelAdapter {
    if (model.includes('qwen2.5-coder')) {
      return new Qwen25CoderAdapter();
    } else {
      throw new NotImplementedError(`no model adapter for ${model}`);
    }
  }
}
