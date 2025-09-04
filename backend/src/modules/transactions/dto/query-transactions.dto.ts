// transactions/dto/query-transactions.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TxType, GameCode } from '../../common/enums';

export class QueryTransactionsDto {
  @ApiPropertyOptional({ enum: Object.values(TxType) })
  @IsOptional() @IsEnum(TxType)
  type?: TxType; // BET | PAYOUT | DEPOSIT | WITHDRAWAL

  @ApiPropertyOptional({ enum: Object.values(GameCode) })
  @IsOptional() @IsEnum(GameCode)
  game?: GameCode; // slots | roulette | blackjack

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00Z', format: 'date-time' })
  @IsOptional() @IsString()
  from?: string; // inclusive

  @ApiPropertyOptional({ example: '2025-09-07T23:59:59Z', format: 'date-time' })
  @IsOptional() @IsString()
  to?: string;   // inclusive

  @ApiPropertyOptional({ example: 1, type: Number, minimum: 1 })
  @Type(() => Number) @IsInt() @Min(1) @IsOptional()
  page = 1;

  @ApiPropertyOptional({ example: 20, type: Number, minimum: 1 })
  @Type(() => Number) @IsInt() @Min(1) @IsOptional()
  limit = 20;
}
