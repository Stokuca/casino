import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryPlayersDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ enum: ['revenue', 'bets', 'lastactive'], example: 'revenue' })
  @IsOptional()
  @Transform(({ value }) => String(value).toLowerCase())
  @IsIn(['revenue', 'bets', 'lastactive'])
  // napomena: u SQL-u koristiš "lastActiveAt"; mapiranje radiš u servisu
  sort: 'revenue' | 'bets' | 'lastactive' = 'revenue';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  @IsOptional()
  @Transform(({ value }) => String(value).toLowerCase())
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
