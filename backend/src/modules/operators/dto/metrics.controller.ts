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
  
  @UseGuards(OperatorJwtGuard)
  @Controller('operator/metrics')
  export class MetricsController {
    constructor(private readonly metrics: MetricsService) {}
  
    // ---------------------------------------------------------
    // Revenue (po periodu)
    // ---------------------------------------------------------
    @Get('revenue')
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
  