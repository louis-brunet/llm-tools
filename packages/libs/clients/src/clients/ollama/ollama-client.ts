import { GenerateRequest, GenerateResponse, Ollama } from 'ollama';
import { IOllamaClientConfig } from './types';

export class OllamaClient {
  private readonly ollama: Ollama;

  constructor(config: IOllamaClientConfig) {
    this.ollama = new Ollama({ host: config.serverOrigin });
  }

  // async generate(
  //   request: GenerateRequest & { stream: true },
  // ): Promise<AbortableAsyncIterator<GenerateResponse>>;
  // async generate(
  //   request: GenerateRequest,
  // ): Promise<AbortableAsyncIterator<GenerateResponse> | GenerateResponse> {
  //   return await this.ollama.generate({
  //     ...request,
  //     // stream: false,
  //   });
  // }

  // async generate<TRequest extends GenerateRequest>(request: TRequest) {
  //   return await this.ollama.generate({
  //     ...request,
  //     // stream: false,
  //   });
  // }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    return await this.ollama.generate({
      ...request,
      stream: false,
    });
  }

  async generateStream(request: GenerateRequest) {
    return await this.ollama.generate({
      ...request,
      stream: true,
    });
  }
}
