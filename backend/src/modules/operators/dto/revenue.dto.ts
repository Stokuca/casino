import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum Granularity {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class RevenueQueryDto {
  @ApiPropertyOptional({ enum: Granularity, example: Granularity.DAILY })
  @IsEnum(Granularity)
  granularity: Granularity = Granularity.DAILY;

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  from?: string; // ISO (UTC)

  @ApiPropertyOptional({ example: '2025-09-07T23:59:59Z' })
  @IsOptional()
  @IsISO8601()
  to?: string;   // ISO (UTC)
}
