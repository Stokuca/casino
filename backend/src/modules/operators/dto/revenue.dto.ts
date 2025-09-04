import { IsEnum, IsOptional, IsISO8601 } from 'class-validator';

export enum Granularity {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class RevenueQueryDto {
  @IsEnum(Granularity)
  granularity: Granularity = Granularity.DAILY;

  @IsOptional()
  @IsISO8601()
  from?: string; // ISO string (UTC)

  @IsOptional()
  @IsISO8601()
  to?: string;   // ISO string (UTC)
}
