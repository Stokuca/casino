import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RangeDto {
  @IsOptional() @IsISO8601() from?: string;
  @IsOptional() @IsISO8601() to?: string;
}

export class LimitRangeDto extends RangeDto {
  @IsOptional()
  @Type(() => Number)  // "5" -> 5
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
