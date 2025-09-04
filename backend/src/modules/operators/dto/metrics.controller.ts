import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { OperatorJwtGuard } from '../../common/operator-jwt.guard';
import { Granularity, RevenueQueryDto } from './revenue.dto';

function parseDates(from?: string, to?: string) {
  const now = new Date();
  const toDate = to ? new Date(to) : now;
  const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 3600 * 1000); // default 30d
  return { fromDate, toDate };
}

@UseGuards(OperatorJwtGuard)
@Controller('operator/metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get('revenue')
  async revenue(@Query() q: RevenueQueryDto) {
    // ručna validacija jer koristimo DTO u @Query
    const dto = plainToInstance(RevenueQueryDto, q);
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) {
      // u realnom projektu baci BadRequestException sa detaljima
      throw errors[0];
    }

    const { fromDate, toDate } = parseDates(dto.from, dto.to);

    return this.metrics.revenueByPeriod({
      granularity: dto.granularity ?? Granularity.DAILY,
      from: fromDate,
      to: toDate,
    });
  }

  @Get('revenue-by-game')
  async revenueByGame(@Query() q: { from?: string; to?: string }) {
    const { fromDate, toDate } = parseDates(q.from, q.to);
    return this.metrics.revenueByGame({ from: fromDate, to: toDate });
  }
}
