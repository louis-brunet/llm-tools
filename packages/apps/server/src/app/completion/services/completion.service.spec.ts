import { Test, TestingModule } from '@nestjs/testing';
import { CompletionService } from './completion.service';
import { LlamaCppAdapter } from '../adapters';

describe('CompletionService', () => {
  let service: CompletionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompletionService,
        { provide: LlamaCppAdapter, useValue: {} },
      ],
    }).compile();

    service = module.get<CompletionService>(CompletionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
