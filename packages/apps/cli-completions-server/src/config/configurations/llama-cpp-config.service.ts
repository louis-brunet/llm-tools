import { Injectable } from '@nestjs/common';
import { InferType, object, string } from 'yup';
import { AbstractConfigService } from './abstract-config.service';

export interface LlamaCppConfig {
  serverOrigin: string;
}

const llamaCppEnvSchema = object({
  LLAMA_SERVER_ORIGIN: string().default('http://127.0.0.1:8012').url(),
});

type LlamaCppEnvSchema = typeof llamaCppEnvSchema;
type LlamaCppEnv = InferType<LlamaCppEnvSchema>;

@Injectable()
export class LlamaCppConfigService extends AbstractConfigService<
  LlamaCppConfig,
  LlamaCppEnv,
  LlamaCppEnvSchema
> {
  public override mapEnv(env: LlamaCppEnv): LlamaCppConfig {
    return {
      serverOrigin: env.LLAMA_SERVER_ORIGIN,
    };
  }

  public override getEnvSchema() {
    return llamaCppEnvSchema;
  }
}
