import { IsString, Matches } from 'class-validator';

// amount u centima kao string (pozitivan integer)
const centsRegex = /^[1-9]\d*$/;

export class AmountDto {
  @IsString()
  @Matches(centsRegex, { message: 'amountCents must be positive integer string' })
  amountCents!: string;
}
