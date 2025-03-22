import { Module } from '@nestjs/common';
import { LlamaCppConfigService } from './configurations/llama-cpp-config.service';
import { HelpersModule } from '#helpers/helpers.module';

@Module({
  imports: [HelpersModule],
  providers: [
    LlamaCppConfigService,
    // { provide: PROCESS_ENV_INJECTABLE, useFactory: () => process.env },
  ],
  exports: [
    LlamaCppConfigService,
    //PROCESS_ENV_INJECTABLE
  ],
})
export class ConfigModule {}
