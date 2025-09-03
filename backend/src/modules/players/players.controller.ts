import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import { PlayerJwtGuard } from '../common/player-jwt.guard';

@Controller('me')
export class PlayersController {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepo: Repository<Player>,
  ) {}

  @UseGuards(PlayerJwtGuard)
  @Get('balance')
  async balance(@Req() req: any) {
    const playerId = req.user.sub as string;
    const player = await this.playersRepo.findOneByOrFail({ id: playerId });
    const cents = BigInt(player.balanceCents);

    return {
      balanceCents: cents.toString(),
      balance: Number(cents) / 100,
    };
  }
}
