import { IModelAdapterInfillRequest, IModelAdapter } from './types';

export class Qwen25CoderAdapter implements IModelAdapter {
  private static FIM_TOKENS = {
    prefix: '<|fim_prefix|>',
    suffix: '<|fim_suffix|>',
    middle: '<|fim_middle|>',
    pad: '<|fim_pad|>',
    repo: '<|repo_name|>',
    fileSeparator: '<|file_sep|>',
  };

  /**
   * @example
   *   `
   *   <FIM_REP>myproject
   *   <FIM_SEP>{chunk 0 filename}
   *   {chunk 0 text}
   *   <FIM_SEP>{chunk 1 filename}
   *   {chunk 1 text}
   *   ...
   *   <FIM_SEP>filename
   *   <FIM_PRE>[input_prefix]<FIM_SUF>[input_suffix]<FIM_MID>[prompt]
   *   `;
   */
  createInfillPrompt(request: IModelAdapterInfillRequest): string {
    const fimTokens = Qwen25CoderAdapter.FIM_TOKENS;

    const prompt =
      (request.system !== undefined ? `${request.system}\n` : '') +
      `${fimTokens.repo}${request.repoName}\n` +
      (request.inputExtra?.reduce((previous, file) => {
        return (
          `${previous}${fimTokens.fileSeparator}${file.fileName}\n` +
          (file.text ? `${file.text}\n` : '')
        );
      }, '') ?? '') +
      `${fimTokens.fileSeparator}${request.currentFileName}\n` +
      `${fimTokens.prefix}${request.inputPrefix}${fimTokens.suffix}${request.inputSuffix}${fimTokens.middle}`;

    return prompt;
  }
}
