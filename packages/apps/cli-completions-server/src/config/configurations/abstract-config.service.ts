import { ValidationService } from '#helpers/services';
import { Inject } from '@nestjs/common';
import { Schema } from 'yup';

export abstract class AbstractConfigService<
  TConfig,
  TEnv,
  TEnvSchema extends Schema<TEnv>,
> {
  protected readonly config: TConfig;

  constructor(@Inject(ValidationService) validationService: ValidationService) {
    this.config = this.mapEnv(
      validationService.validateEnv(this.getEnvSchema()),
    );
  }

  abstract mapEnv(env: TEnv): TConfig;
  abstract getEnvSchema(): TEnvSchema;

  getConfig(): TConfig {
    return this.config;
  }
}
