import { IsEnum, IsString, Matches } from 'class-validator';
import { GameCode, Outcome } from '../../common/enums';

const centsRegex = /^[1-9]\d*$/;

export class PlayDto {
  @IsEnum(GameCode) gameCode!: GameCode;
  @IsString() @Matches(centsRegex) amountCents!: string;
  @IsEnum(Outcome) outcome!: Outcome; // 'WIN' | 'LOSS'
}
