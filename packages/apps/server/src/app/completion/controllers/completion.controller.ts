import { Body, Controller, Post } from '@nestjs/common';
import { CompletionService } from '../services';
import { InfillRequestDto } from '../dtos';

@Controller('completion')
export class CompletionController {
  constructor(private readonly completionService: CompletionService) {}

  @Post('infill')
  public async postInfill(@Body() request: InfillRequestDto) {
    return this.completionService.infill(request);
  }
}
