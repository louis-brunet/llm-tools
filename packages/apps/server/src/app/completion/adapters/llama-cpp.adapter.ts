import {
  LlamaCppConfig,
  LlamaCppConfigService,
} from '#config/configurations/llama-cpp-config.service';
import { LlamaCppClient, LlamaCppInfillResponse } from '@llm-tools/clients';
import { Injectable, Logger } from '@nestjs/common';
import { InfillRequest } from '../interfaces';

// const infillResponseSchema = object({
//   content: string().required(),
//   tokens_predicted: number().integer().required(),
// });
// export type LlamaCppInfillResponse = InferType<typeof infillResponseSchema>;

@Injectable()
export class LlamaCppAdapter {
  private readonly config: LlamaCppConfig;
  private readonly logger: Logger = new Logger(LlamaCppAdapter.name);
  private readonly llamaCppClient: LlamaCppClient;

  constructor(configService: LlamaCppConfigService) {
    this.config = configService.getConfig();
    this.llamaCppClient = new LlamaCppClient({
      serverOrigin: this.config.serverOrigin,
    });
  }

  public async infill(request: InfillRequest): Promise<LlamaCppInfillResponse> {
    this.logger.debug(`[infill] ${JSON.stringify(request)}`);
    const inputExtra =
      request.context?.map((item) => ({
        filename: item.fileName,
        text: item.content,
      })) ?? [];
    // this.logger.debug(`[infill] ${JSON.stringify({ inputExtra })}`);
    return await this.llamaCppClient.infill({
      input_prefix: request.before,
      input_suffix: request.after,
      input_extra: inputExtra,
      prompt: request.prompt,
    });

    // // https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md#post-infill-for-code-infilling
    // const response = await firstValueFrom(
    //   this.httpService
    //     .post(
    //       `${this.config.serverOrigin}/infill`,
    //       llamaRequest,
    //       // { headers: { 'Content-Type': 'application/json' } },
    //     )
    //     .pipe(
    //       tap((response) => {
    //         this.logger.debug(`[infill] response status ${response.status}`);
    //         // this.logger.debug(
    //         //   `[infill] response ${JSON.stringify(response.data)}`,
    //         // );
    //       }),
    //       // tap((response) => response.data),
    //       catchError((error) => {
    //         this.logger.error(`[infill] error ${JSON.stringify(error)}`);
    //         this.logger.error(
    //           `[infill] error response ${JSON.stringify((error as AxiosError)?.response?.data)}`,
    //         );
    //         throw error;
    //         // return of({
    //         //   content: '',
    //         //   tokens_predicted: 0,
    //         // });
    //       }),
    //     ),
    // );
    // return this.validationService.validate(infillResponseSchema, response.data);
  }
}
