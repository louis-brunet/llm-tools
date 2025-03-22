import { PROCESS_ENV_INJECTABLE } from '#helpers/env';
import { Inject, Injectable } from '@nestjs/common';
import { Flags, Schema, ValidateOptions } from 'yup';

@Injectable()
export class ValidationService {
  constructor(@Inject(PROCESS_ENV_INJECTABLE) private readonly env: unknown) {}

  public validate<T, C, F extends Flags, D>(
    schema: Schema<T, C, D, F>,
    data: unknown,
    options?: ValidateOptions<C>,
  ) {
    return schema.validateSync(data, options);
  }

  public validateEnv<T, C, F extends Flags, D>(schema: Schema<T, C, D, F>) {
    return this.validate(schema, this.env, { stripUnknown: true });
  }
}
