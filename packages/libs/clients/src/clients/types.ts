import { ILlamaCppClientConfig } from './llama-cpp';
import { IOllamaClientConfig as IOllamaClientConfig } from './ollama';

export enum LlmToolsBackendEnum {
  LLAMA_CPP = 'llama-cpp',
  OLLAMA = 'ollama',
}

// export type LlmToolsClientConfigLlamaCpp = {
//   backend: LlmToolsBackendEnum.LLAMA_CPP;
//   serverOrigin: string;
// };

export interface ILlmToolsClientConfigLlamaCpp extends ILlamaCppClientConfig {
  backend: LlmToolsBackendEnum.LLAMA_CPP;
}

export interface ILlmToolsClientConfigOllama extends IOllamaClientConfig {
  backend: LlmToolsBackendEnum.OLLAMA;
}

export type LlmToolsServiceConfig =
  | ILlmToolsClientConfigLlamaCpp
  | ILlmToolsClientConfigOllama;

// export type LlmToolsBackendType = LlmToolsClientConfig['backend'];

export interface ILlmToolsInfillRequestExtraContext {
  fileName: string;
  text: string;
}

/** https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md#post-infill-for-code-infilling */
export interface ILlmToolsInfillRequest {
  inputPrefix: string;
  prompt: string;
  inputSuffix: string;
  inputExtra?: Array<ILlmToolsInfillRequestExtraContext> | undefined;
  singleLine?: boolean | undefined;
}

export interface ILlmToolsInfillResponse {
  content: string;
}

export interface ILlmToolsCliCompletionRequestHistoryItem {
  command: string;
  // stdout: string;
  // stderr: string;
}

export interface ILlmToolsCliCompletionRequest {
  promptPrefix: string;
  promptSuffix: string;
  shell: string;
  history: ILlmToolsCliCompletionRequestHistoryItem[];
  matchedHistory: ILlmToolsCliCompletionRequestHistoryItem[];
  project: {
    path: string;
    files: string[];
  };
}

export interface ILlmToolsClient<
  IInfillRequest,
  IInfillResponse,
  ICompletionRequest,
  ICompletionResponse,
  ICompletionStreamRequest,
  ICompletionStreamResponse,
> {
  infill(request: IInfillRequest): Promise<IInfillResponse>;
  completion(request: ICompletionRequest): Promise<ICompletionResponse>;
  completionStream(
    request: ICompletionStreamRequest,
  ): AsyncGenerator<ICompletionStreamResponse>;
}

export interface ILlmToolsService {
  infill(request: ILlmToolsInfillRequest): Promise<ILlmToolsInfillResponse>;
  cliCompletion(request: ILlmToolsCliCompletionRequest): Promise<string>;
}

// export interface ILlmToolsClientMapper<
//   IInfillRequest,
//   IInfillResponse,
//   ICompletionRequest,
//   ICompletionResponse,
//   // ICompletionStreamRequest,
//   // ICompletionStreamResponse,
// > {
//   mapInfillRequest(request: ILlmToolsInfillRequest): IInfillRequest;
//   mapInfillResponse(response: IInfillResponse): ILlmToolsInfillResponse;
//
//   mapCliCompletionRequest(
//     request: ILlmToolsCliCompletionRequest,
//   ): ICompletionRequest;
//   mapCliCompletionResponse(response: ICompletionResponse): string;
// }
