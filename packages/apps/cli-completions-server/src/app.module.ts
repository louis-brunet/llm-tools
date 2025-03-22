import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompletionModule } from './app/completion/completion.module';
import { HelpersModule } from './helpers/helpers.module';
import { ConfigModule } from './config/config.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [CompletionModule, HelpersModule, ConfigModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
