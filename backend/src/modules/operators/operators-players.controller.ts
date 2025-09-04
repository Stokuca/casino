import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { OperatorJwtGuard } from '../common/operator-jwt.guard';
import { OperatorsPlayersService } from './operators-players.service';
import { QueryPlayersDto } from './dto/query-players.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { ActivePlayersDto } from './dto/active-players.dto';

@UseGuards(OperatorJwtGuard)
@Controller('operator')
export class OperatorsPlayersController {
  constructor(private readonly svc: OperatorsPlayersService) {}

  @Get('players/leaderboard')
  async leaderboard(@Query() q: LeaderboardDto) {
    const dto = plainToInstance(LeaderboardDto, q);
    await validateOrReject(dto);
    return this.svc.leaderboard(dto);
  }

  @Get('players')
  async players(@Query() q: QueryPlayersDto) {
    const dto = plainToInstance(QueryPlayersDto, q);
    await validateOrReject(dto);
    return this.svc.listPlayers(dto);
  }

  @Get('metrics/active-players')
  async activePlayers(@Query() q: ActivePlayersDto) {
    const dto = plainToInstance(ActivePlayersDto, q);
    await validateOrReject(dto);
    return this.svc.activePlayers(dto);
  }
}
