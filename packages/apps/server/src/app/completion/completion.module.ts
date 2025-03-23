import { ConfigModule } from '#config/config.module';
import { HelpersModule } from '#helpers/helpers.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LlamaCppAdapter } from './adapters';
import { CompletionController } from './controllers/completion.controller';
import { CompletionService } from './services/completion.service';

@Module({
  imports: [ConfigModule, HttpModule, HelpersModule],
  providers: [CompletionService, LlamaCppAdapter],
  controllers: [CompletionController],
})
export class CompletionModule {}
