import type {
  ILlmToolsCliCompletionRequest,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
  ILlmToolsService,
  LlmToolsClientConfigOllama,
} from '../types';

export class OllamaService implements ILlmToolsService {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_config: LlmToolsClientConfigOllama) {}

  infill(_request: ILlmToolsInfillRequest): Promise<ILlmToolsInfillResponse> {
    // return Promise.resolve({
    //   content: '',
    //   tokensPredicted: 0,
    // });
    throw new Error('infill not implemented');
  }

  cliCompletion(_request: ILlmToolsCliCompletionRequest): Promise<string> {
    throw new Error('cliCompletion not implemented');
  }
}
