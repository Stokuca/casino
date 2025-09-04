import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OperatorsPlayersService } from './operators-players.service';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { QueryPlayersDto } from './dto/query-players.dto';
import { ActivePlayersDto } from './dto/active-players.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { OperatorJwtGuard } from '../common/operator-jwt.guard';

@UseGuards(OperatorJwtGuard)
@Controller('operator')
export class OperatorsPlayersController {
  constructor(private readonly svc: OperatorsPlayersService) {}

  // /operator/players/leaderboard?limit=10
  @Get('players/leaderboard')
  async leaderboard(@Query() q: LeaderboardDto) {
    const dto = plainToInstance(LeaderboardDto, q);
    await validateOrReject(dto);
    return this.svc.leaderboard(dto);
  }

  // /operator/players?sort=revenue|bets|lastActive&order=desc&page=1&limit=10
  @Get('players')
  async players(@Query() q: QueryPlayersDto) {
    const dto = plainToInstance(QueryPlayersDto, q);
    await validateOrReject(dto);
    return this.svc.listPlayers(dto);
  }

  // /operator/metrics/active-players?windowDays=7
  @Get('metrics/active-players')
  async activePlayers(@Query() q: ActivePlayersDto) {
    const dto = plainToInstance(ActivePlayersDto, q);
    await validateOrReject(dto);
    return this.svc.activePlayers(dto);
  }
}
