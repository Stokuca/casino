// backend/src/modules/operators/dto/metrics.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

// ✅ Swagger dodaci
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { OperatorJwtGuard } from '../../common/operator-jwt.guard';
import { MetricsService } from './metrics.service';
import { Granularity, RevenueQueryDto } from './revenue.dto';
import { RangeDto, LimitRangeDto } from './metrics-queries.dto';

function parseDates(from?: string, to?: string) {
  const now = new Date();
  const toDate = to ? new Date(to) : now;
  const fromDate = from
    ? new Date(from)
    : new Date(toDate.getTime() - 30 * 24 * 3600 * 1000); // default 30 dana
  return { fromDate, toDate };
}

// ✅ Swagger: tag + named bearer (iz main.ts: 'access-token')
@ApiTags('Metrics')
@ApiBearerAuth('access-token')
@UseGuards(OperatorJwtGuard)
@Controller('operator/metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  // ---------------------------------------------------------
  // Revenue (po periodu)
  // ---------------------------------------------------------
  @Get('revenue')
  @ApiOperation({ summary: 'Revenue (GGR) by period' })
  @ApiOkResponse({
    schema: {
      example: {
        totalGgrCents: '123450',
        series: [
          { bucketStart: '2025-09-01', ggrCents: '15000' },
          { bucketStart: '2025-09-02', ggrCents: '22000' },
        ],
      },
    },
  })
  async revenue(@Query() q: RevenueQueryDto) {
    const dto = plainToInstance(RevenueQueryDto, q);
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) throw new BadRequestException(errors);

    const { fromDate, toDate } = parseDates(dto.from, dto.to);

    return this.metrics.revenueByPeriod({
      granularity: dto.granularity ?? Granularity.DAILY,
      from: fromDate,
      to: toDate,
    });
  }

  // ---------------------------------------------------------
  // Revenue by game (pie)
  // ---------------------------------------------------------
  @Get('revenue-by-game')
  @ApiOperation({ summary: 'Revenue by game (pie)' })
  @ApiOkResponse({
    schema: {
      example: [
        { gameCode: 'slots', ggrCents: '65000' },
        { gameCode: 'roulette', ggrCents: '42000' },
        { gameCode: 'blackjack', ggrCents: '16450' },
      ],
    },
  })
  async revenueByGame(@Query() q: RangeDto) {
    const dto = plainToInstance(RangeDto, q);
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) throw new BadRequestException(errors);

    const { fromDate, toDate } = parseDates(dto.from, dto.to);
    return this.metrics.revenueByGame({ from: fromDate, to: toDate });
  }

  // ---------------------------------------------------------
  // Games metrics
  // ---------------------------------------------------------
  @Get('games/top-profitable')
  @ApiOperation({ summary: 'Top profitable games' })
  @ApiOkResponse({
    schema: {
      example: [
        { gameCode: 'slots', ggrCents: '65000' },
        { gameCode: 'roulette', ggrCents: '42000' },
      ],
    },
  })
  async topProfitable(@Query() q: LimitRangeDto) {
    const dto = plainToInstance(LimitRangeDto, q);
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) throw new BadRequestException(errors);

    const { fromDate, toDate } = parseDates(dto.from, dto.to);
    const limit = dto.limit ?? 5;
    return this.metrics.topProfitableGames(limit, fromDate, toDate);
  }

  @Get('games/most-popular')
  @ApiOperation({ summary: 'Most popular games' })
  @ApiOkResponse({
    schema: {
      example: [
        { gameCode: 'slots', betsCount: 310 },
        { gameCode: 'roulette', betsCount: 190 },
      ],
    },
  })
  async mostPopular(@Query() q: LimitRangeDto) {
    const dto = plainToInstance(LimitRangeDto, q);
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) throw new BadRequestException(errors);

    const { fromDate, toDate } = parseDates(dto.from, dto.to);
    const limit = dto.limit ?? 5;
    return this.metrics.mostPopularGames(limit, fromDate, toDate);
  }

  @Get('games/avg-bet')
  @ApiOperation({ summary: 'Average bet per game' })
  @ApiOkResponse({
    schema: {
      example: [
        { gameCode: 'slots', avgBetCents: '420' },
        { gameCode: 'roulette', avgBetCents: '930' },
      ],
    },
  })
  async avgBet(@Query() q: RangeDto) {
    const dto = plainToInstance(RangeDto, q);
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) throw new BadRequestException(errors);

    const { fromDate, toDate } = parseDates(dto.from, dto.to);
    return this.metrics.avgBetPerGame(fromDate, toDate);
  }

  @Get('games/rtp')
  @ApiOperation({ summary: 'Actual vs theoretical RTP' })
  @ApiOkResponse({
    schema: {
      example: [
        { gameCode: 'slots', theoreticalRtpPct: 96, actualRtpPct: 94.3 },
        { gameCode: 'roulette', theoreticalRtpPct: 97, actualRtpPct: 96.2 },
      ],
    },
  })
  async rtp(@Query() q: RangeDto) {
    const dto = plainToInstance(RangeDto, q);
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) throw new BadRequestException(errors);

    const { fromDate, toDate } = parseDates(dto.from, dto.to);
    return this.metrics.rtpPerGame(fromDate, toDate);
  }
}
