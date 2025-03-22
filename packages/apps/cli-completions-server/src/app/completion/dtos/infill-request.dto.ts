import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { InfillRequest, InfillRequestContextItem } from '../interfaces';

export class InfillRequestContextItemDto implements InfillRequestContextItem {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  content!: string;
}

export class InfillRequestDto implements InfillRequest {
  @IsString()
  before!: string;

  @IsString()
  prompt!: string;

  @IsString()
  after!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfillRequestContextItemDto)
  context?: InfillRequestContextItemDto[];
}
