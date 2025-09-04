import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { PlayerJwtGuard } from '../common/player-jwt.guard';
import { BetsService } from './bets.service';
import { PlayDto } from './dto/play.dto';

@ApiTags('Bets')
@ApiBearerAuth('access-token')
@UseGuards(PlayerJwtGuard)
@Controller('bets')
export class BetsController {
  constructor(private readonly bets: BetsService) {}

  @Post('play')
  @ApiOperation({ summary: 'Place bet (simulate win/loss/auto)' })
  @ApiOkResponse({
    description: 'Bet outcome + balance update',
    schema: {
      example: {
        outcome: 'WIN',
        betTxId: 'b3t-uuid',
        payoutTxId: 'p4y-uuid',
        balanceCents: '102300',
        gameCode: 'slots',
        amountCents: '500',
      },
    },
  })
  play(@Req() req: any, @Body() dto: PlayDto) {
    return this.bets.play(req.user.sub, dto.gameCode, dto.amountCents, dto.outcome);
  }
}
