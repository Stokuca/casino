import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class QueryPlayersDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }) => String(value).toLowerCase())
  @IsIn(['revenue', 'bets', 'lastactive'])
  // napomena: u SQL-u koristiš "lastActiveAt", ovde primamo 'lastActive'
  // pa u servisu već mapiraš na odgovarajuću kolonu
  sort: 'revenue' | 'bets' | 'lastactive' = 'revenue';

  @IsOptional()
  @Transform(({ value }) => String(value).toLowerCase())
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
