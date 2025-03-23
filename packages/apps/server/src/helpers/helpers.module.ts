import { Module } from '@nestjs/common';
import { ValidationService } from './services/validation.service';
import { PROCESS_ENV_INJECTABLE } from './env';

@Module({
  // imports: [ConfigModule],
  providers: [
    ValidationService,
    { provide: PROCESS_ENV_INJECTABLE, useFactory: () => process.env },
  ],
  exports: [ValidationService, PROCESS_ENV_INJECTABLE],
})
export class HelpersModule {}
