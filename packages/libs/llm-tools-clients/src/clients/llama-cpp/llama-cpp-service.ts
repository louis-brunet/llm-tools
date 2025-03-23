import {
  ILlmToolsCliCompletionRequest,
  ILlmToolsInfillRequest,
  ILlmToolsInfillResponse,
  ILlmToolsService,
  LlmToolsClientConfigLlamaCpp,
} from '../types';
import { LlamaCppClient } from './llama-cpp-client';
import {
  ILlamaCppInfillRequest,
  LlamaCppCompletionResponse,
  LlamaCppInfillResponse,
} from './types';

interface ILlmToolsManualInfillRequest extends ILlmToolsInfillRequest {
  repoName: string;
  currentFileName: string;
}

export class LlamaCppService implements ILlmToolsService {
  private client: LlamaCppClient;

  constructor(config: LlmToolsClientConfigLlamaCpp) {
    this.client = new LlamaCppClient(config);
  }

  async infill(
    request: ILlmToolsInfillRequest,
  ): Promise<ILlmToolsInfillResponse> {
    const response = await this.client.infill(this.mapInfillRequest(request));
    return this.mapInfillResponse(response);
  }

  async cliCompletion(request: ILlmToolsCliCompletionRequest): Promise<string> {
    const response = await this.manualInfill({
      repoName: request.project.path,
      currentFileName: 'command-to-complete.zsh',
      inputPrefix: request.promptPrefix,
      inputSuffix: request.promptSuffix,
      prompt: '',
      inputExtra: [
        ...request.project.files.map((file) => ({ fileName: file, text: '' })),
        {
          fileName: '.histfile',
          text: request.history.reduce(
            (previous, historyItem) => `${previous}${historyItem.command}\n`,
            '',
          ),
        },
      ],
      singleLine: true,
    });
    return response.content;

    // // const response = await this.client.infill({
    // //   input_prefix: request.promptPrefix,
    // //   input_suffix: request.promptSuffix,
    // //   input_extra: [
    // //     {
    // //       filename: 'project.zsh',
    // //       text: `working_directory=${request.project.path}\n` +
    // //         `files=${request.project.files.join(":")}\n`,
    // //     },
    // //     {
    // //       filename: '.histfile',
    // //       text: request.history.reduce((previous, historyItem) => {
    // //         return previous + historyItem.command + '\n'
    // //       }, '\n'),
    // //     },
    // //   ],
    // // });
    // // return response.content;
  }

  private async manualInfill(
    request: ILlmToolsManualInfillRequest,
  ): Promise<LlamaCppCompletionResponse> {
    // print_info: FIM PRE token    = 151659 '<|fim_prefix|>'
    // print_info: FIM SUF token    = 151661 '<|fim_suffix|>'
    // print_info: FIM MID token    = 151660 '<|fim_middle|>'
    // print_info: FIM PAD token    = 151662 '<|fim_pad|>'
    // print_info: FIM REP token    = 151663 '<|repo_name|>'
    // print_info: FIM SEP token    = 151664 '<|file_sep|>'

    // NOTE: assumes qwen2.5-coder or compatible FIM model
    const fimTokens = {
      prefix: '<|fim_prefix|>',
      suffix: '<|fim_suffix|>',
      middle: '<|fim_middle|>',
      pad: '<|fim_pad|>',
      repo: '<|repo_name|>',
      fileSeparator: '<|file_sep|>',
    };

    // <FIM_REP>myproject
    // <FIM_SEP>{chunk 0 filename}
    // {chunk 0 text}
    // <FIM_SEP>{chunk 1 filename}
    // {chunk 1 text}
    // ...
    // <FIM_SEP>filename
    // <FIM_PRE>[input_prefix]<FIM_SUF>[input_suffix]<FIM_MID>[prompt]

    const shellName = 'zsh';
    const currentFileName = `current-command.${shellName}`;
    let prompt = //'Use the following context (working directory, files, recent shell command history) to complete the current command line.\n' +
      `${fimTokens.repo}${request.repoName}\n` +
      (request.inputExtra?.reduce((previous, file) => {
        return `${previous}${fimTokens.fileSeparator}${file.fileName}\n` +
          file.text
          ? `${file.text}\n`
          : '';
      }, '') ?? '') +
      `${fimTokens.fileSeparator}${currentFileName}\n` +
      `${fimTokens.prefix}${request.inputPrefix}${fimTokens.suffix}${request.inputSuffix}${fimTokens.middle}`;

    const stop = [];
    if (request.singleLine) {
      stop.push('\n');
      prompt = `You must complete the current command line using valid ${shellName} syntax. The command should be a single line.\n${prompt}`;
    }
    if (request.inputSuffix.trim()) {
      stop.push(request.inputSuffix);
    }
    const response = await this.client.completion({
      prompt,
      temperature: 0.2,
      // top_p: 0.6,
      // top_k: ,
      stop,
    });
    return response;
  }

  private mapInfillRequest(
    request: ILlmToolsInfillRequest,
  ): ILlamaCppInfillRequest {
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

  private mapInfillResponse(
    response: LlamaCppInfillResponse,
  ): ILlmToolsInfillResponse {
    return {
      content: response.content,
      tokensPredicted: response.tokens_predicted,
    };
  }
}
