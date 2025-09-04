import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TxType, GameCode } from '../../common/enums';

export class QueryTransactionsDto {
  @IsOptional() @IsEnum(TxType) type?: TxType;       // BET | PAYOUT | DEPOSIT | WITHDRAWAL
  @IsOptional() @IsEnum(GameCode) game?: GameCode;   // slots | roulette | blackjack
  @IsOptional() @IsString() from?: string;           // ISO date (inclusive)
  @IsOptional() @IsString() to?: string;             // ISO date (inclusive)
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() page = 1;
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit = 20;
}
