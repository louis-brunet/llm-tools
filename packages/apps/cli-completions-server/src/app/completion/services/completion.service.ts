import { Injectable } from '@nestjs/common';
import { LlamaCppAdapter } from '../adapters';
import { InfillRequest } from '../interfaces';

@Injectable()
export class CompletionService {
  constructor(private readonly llamaCppAdapter: LlamaCppAdapter) {}

  public async infill(request: InfillRequest): Promise<string> {
    const response = await this.llamaCppAdapter.infill(request);
    return response.content;
  }
}
