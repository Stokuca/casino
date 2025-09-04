import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// amount u centima kao string (pozitivan integer)
const centsRegex = /^[1-9]\d*$/;

export class AmountDto {
  @ApiProperty({ example: '5000', description: 'Amount in cents as string (positive integer)' })
  @IsString()
  @Matches(centsRegex, { message: 'amountCents must be positive integer string' })
  amountCents!: string;
}
