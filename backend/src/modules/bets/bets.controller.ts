import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PlayerJwtGuard } from '../common/player-jwt.guard';
import { BetsService } from './bets.service';
import { PlayDto } from './dto/play.dto';

@UseGuards(PlayerJwtGuard)
@Controller('bets')
export class BetsController {
  constructor(private readonly bets: BetsService) {}

  @Post('play')
  play(@Req() req: any, @Body() dto: PlayDto) {
    return this.bets.play(req.user.sub, dto.gameCode, dto.amountCents, dto.outcome);
  }
}
