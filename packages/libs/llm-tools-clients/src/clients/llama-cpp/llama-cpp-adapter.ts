import { LlmToolsClientAdapter } from '../llm-tools-client-adapter';
import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
  LlmToolsClientConfigLlamaCpp,
} from '../types';
import { LlamaCppClient } from './llama-cpp-client';
import {
  ILlamaCppCompletionNoStreamRequest,
  ILlamaCppCompletionStreamRequest,
  ILlamaCppInfillRequest,
  LlamaCppCompletionNoStreamResponse,
  LlamaCppCompletionStreamResponse,
  LlamaCppInfillResponse,
} from './types';

export class LlamaCppClientAdapter extends LlmToolsClientAdapter<
  ILlamaCppInfillRequest,
  LlamaCppInfillResponse,
  ILlamaCppCompletionNoStreamRequest,
  LlamaCppCompletionNoStreamResponse,
  ILlamaCppCompletionStreamRequest,
  LlamaCppCompletionStreamResponse
> {
  constructor(config: LlmToolsClientConfigLlamaCpp) {
    super(new LlamaCppClient(config));
  }

  mapInfillRequest(request: ILlmToolsInfillRequest): ILlamaCppInfillRequest {
    return {
      input_prefix: request.inputPrefix,
      prompt: request.prompt,
      input_suffix: request.inputSuffix,
      input_extra: request.inputExtra?.map((item) => ({
        filename: item.fileName,
        text: item.text,
      })),
    };
  }

  mapInfillResponse(response: LlamaCppInfillResponse): ILlmToolsInfillResponse {
    return {
      content: response.content,
      tokensPredicted: response.tokens_predicted,
    };
  }

  mapCliCompletionRequest(
    request: ILlmToolsCliCompletionRequest,
  ): ILlamaCppCompletionNoStreamRequest {
    // const historyPrompt = request.history
    //   .map((historyItem) => historyItem.command)
    //   .join('\n');
    // // `<zsh_history>\n${request.history
    // //   .map((historyItem) => {
    // //     return `<command>${historyItem.command}</command><stdout>\n${historyItem.stdout}\n${historyItem.stderr}\n`;
    // //   })
    // //   .join('\n')}` + `</zsh_history>`;
    // // const commandPrompt =
    // //   `<command>\n${request.promptPrefix}\n</command>\n` +
    const multiShotRequests: Array<[ILlmToolsCliCompletionRequest, string]> = [
      [
        {
          project: {
            path: '/home/someuser/myproject',
            files: ['main.tf'],
          },
          history: [
            { command: 'terraform init' },
            { command: 'terraform plan' },
          ],
          promptPrefix: 'ter',
        },
        'raform apply',
      ],
    ];
    const prompt =
      multiShotRequests
        .map((exampleRequest) => {
          const [example, result] = exampleRequest;
          return this.createCliCompletionPrompt(example, result);
        })
        .join('\n\n') + this.createCliCompletionPrompt(request);
    return {
      // prompt: `# zsh command history:\n ${historyPrompt}\n# current command to complete:\n${request.promptPrefix}`,
      prompt,
      stream: false,
      n_predict: 40,
      // stop: ['</completion>'],
    };
  }

  mapCliCompletionResponse(
    response: LlamaCppCompletionNoStreamResponse,
  ): string {
    return response.content;
  }

  private createCliCompletionPrompt(
    request: ILlmToolsCliCompletionRequest,
    completionResult?: string,
  ): string {
    return (
      JSON.stringify({
        context: {
          zsh_history: request.history
            .map((historyItem) => historyItem.command)
            .join('\n'),
          project: {
            working_directory: request.project.path,
            files: request.project.files.join('\n'),
          },
        },
        input: request.promptPrefix,
      }) +
      (completionResult !== undefined
        ? JSON.stringify({
            output: completionResult,
          })
        : '')
    );
    // const shell = 'zsh';
    // return (
    //   '<input>\n' +
    //   `<${shell}-history>\n` +
    //   `${request.history
    //     .map((historyItem) => historyItem.command)
    //     .join('\n')}\n` +
    //   `</${shell}-history>\n` +
    //   `<shell-context working-directory="${request.project.path}">\n` +
    //   `<files>\n${request.project.files.join('\n')}</files>\n` +
    //   `</shell-context>\n` +
    //   '<command-line>\n' +
    //   '<prefix>\n' +
    //   request.promptPrefix +
    //   '</prefix>\n' +
    //   '</command-line>\n' +
    //   '<output>\n' +
    //   (completionResult !== undefined ? `${completionResult}</output>\n` : '')
    //   // '<completion>\n' +
    //   // (completionResult !== undefined ? (`${completionResult}</completion>\n</command>\n`) : '')
    // );
  }
}
