import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { OperatorJwtGuard } from '../common/operator-jwt.guard';
import { OperatorsPlayersService } from './operators-players.service';
import { QueryPlayersDto } from './dto/query-players.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { ActivePlayersDto } from './dto/active-players.dto';

@ApiTags('OperatorPlayers')
@ApiBearerAuth('access-token')
@UseGuards(OperatorJwtGuard)
@Controller('operator')
export class OperatorsPlayersController {
  constructor(private readonly svc: OperatorsPlayersService) {}

  @Get('players/leaderboard')
  @ApiOperation({ summary: 'Top players by GGR' })
  @ApiOkResponse({
    schema: {
      example: {
        items: [
          {
            playerId: '2a9b0d3c-6f41-4b2e-8b1f-0d8c9a7e1234',
            email: 'p1@example.com',
            ggrCents: '24500',
            createdAt: '2025-09-01T12:00:00.000Z'
          },
          {
            playerId: '5e7f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3344',
            email: 'p2@example.com',
            ggrCents: '18700',
            createdAt: '2025-09-03T09:12:45.000Z'
          }
        ],
        total: 2
      }
    }
  })
  async leaderboard(@Query() q: LeaderboardDto) {
    const dto = plainToInstance(LeaderboardDto, q);
    await validateOrReject(dto);
    return this.svc.leaderboard(dto);
  }

  @Get('players')
  @ApiOperation({ summary: 'Players table (sort, page, filters)' })
  @ApiOkResponse({
    schema: {
      example: {
        page: 1,
        limit: 10,
        total: 23,
        totalPages: 3,
        hasNext: true,
        items: [
          {
            playerId: 'uuid-player-2',
            email: 'p2@example.com',
            betsCount: 34,
            betCents: '54000',
            payoutCents: '42000',
            revenueCents: '12000',
            lastActiveAt: '2025-09-04T09:22:00.000Z'
          }
        ]
      }
    }
  })
  async players(@Query() q: QueryPlayersDto) {
    const dto = plainToInstance(QueryPlayersDto, q);
    await validateOrReject(dto);
    return this.svc.listPlayers(dto);
  }

  @Get('metrics/active-players')
  @ApiOperation({ summary: 'Active players in window' })
  @ApiOkResponse({
    schema: { example: { windowDays: 7, count: 12 } }
  })
  async activePlayers(@Query() q: ActivePlayersDto) {
    const dto = plainToInstance(ActivePlayersDto, q);
    await validateOrReject(dto);
    return this.svc.activePlayers(dto);
  }
}
