import {
  LlamaCppConfig,
  LlamaCppConfigService,
} from '#config/configurations/llama-cpp-config.service';
import {
  LlamaCppClient,
  LlamaCppInfillResponse,
  LlamaCppModelEnum,
} from '@llm-tools/clients';
import { Injectable, Logger } from '@nestjs/common';
import { InfillRequest } from '../interfaces';

@Injectable()
export class LlamaCppAdapter {
  private readonly config: LlamaCppConfig;
  private readonly logger: Logger = new Logger(LlamaCppAdapter.name);
  private readonly llamaCppClient: LlamaCppClient;

  constructor(configService: LlamaCppConfigService) {
    this.config = configService.getConfig();
    this.llamaCppClient = new LlamaCppClient({
      serverOrigin: this.config.serverOrigin,
      model: LlamaCppModelEnum.QWEN_2_5_CODER,
    });
  }

  public async infill(request: InfillRequest): Promise<LlamaCppInfillResponse> {
    this.logger.debug(`[infill] ${JSON.stringify(request)}`);
    const inputExtra =
      request.context?.map((item) => ({
        filename: item.fileName,
        text: item.content,
      })) ?? [];
    return await this.llamaCppClient.infill({
      input_prefix: request.before,
      input_suffix: request.after,
      input_extra: inputExtra,
      prompt: request.prompt,
    });
  }
}
