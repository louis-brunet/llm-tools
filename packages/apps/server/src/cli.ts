import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { CompletionService } from '#app/completion';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new ConsoleLogger({
      logLevels: ['error', 'warn'],
    }),
  });
  const service = app.get(CompletionService);
  const response = await service.infill({
    before: 'def foo(a, b):\n    ',
    prompt: '',
    after: '\n    return sum',
    context: [{ fileName: 'bar.py', content: 'print("hi")' }],
  });
  console.log(response);
}

bootstrap()
  .then()
  .catch((err: unknown) => {
    console.error(err);
  });
