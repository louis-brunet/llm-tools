import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { PROCESS_ENV_INJECTABLE } from '#helpers/env';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidationService,
        {
          provide: PROCESS_ENV_INJECTABLE,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
