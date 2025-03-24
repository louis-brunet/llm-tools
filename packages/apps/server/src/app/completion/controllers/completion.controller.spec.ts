import { Test, TestingModule } from '@nestjs/testing';
import { CompletionController } from './completion.controller';
import { CompletionService } from '../services';

describe('CompletionController', () => {
  let controller: CompletionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CompletionService, useValue: {} }],
      controllers: [CompletionController],
    }).compile();

    controller = module.get<CompletionController>(CompletionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
