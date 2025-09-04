import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ActivePlayersDto {
  @ApiPropertyOptional({ example: 7, minimum: 1, maximum: 365, description: 'Broj dana za prozor' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(365)
  windowDays: number = 7;
}
