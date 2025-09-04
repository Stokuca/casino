import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RangeDto {
  @ApiPropertyOptional({ example: '2025-09-01T00:00:00Z' })
  @IsOptional() @IsISO8601() from?: string;

  @ApiPropertyOptional({ example: '2025-09-07T23:59:59Z' })
  @IsOptional() @IsISO8601() to?: string;
}

export class LimitRangeDto extends RangeDto {
  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)  // "5" -> 5
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
