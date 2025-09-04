import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Granularity } from './revenue.dto';
import { Transaction } from '../../transactions/transaction.entity';

type Row = { period: Date; totalbet: string; totalpayout: string };
type GameRow = { game: string | null; totalbet: string; totalpayout: string };

function toPgDateTrunc(granularity: Granularity) {
  switch (granularity) {
    case Granularity.DAILY: return 'day';
    case Granularity.WEEKLY: return 'week';
    case Granularity.MONTHLY: return 'month';
  }
}

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async revenueByPeriod(opts: { granularity: Granularity; from?: Date; to?: Date }) {
    const { granularity, from, to } = opts;
    const pgTrunc = toPgDateTrunc(granularity);

    const qb = this.txRepo.createQueryBuilder('t')
      .select(`DATE_TRUNC('${pgTrunc}', t."createdAt")`, 'period')
      .addSelect(`SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)`, 'totalBet')
      .addSelect(`SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`, 'totalPayout');

    if (from) qb.andWhere(`t."createdAt" >= :from`, { from });
    if (to) qb.andWhere(`t."createdAt" <= :to`, { to });

    const rows = await qb
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany<Row>();

    // map u čiste brojeve (centi) + GGR
    return rows.map(r => {
      const totalBet = Number(r.totalbet ?? 0);
      const totalPayout = Number(r.totalpayout ?? 0);
      return {
        period: r.period,                // ISO string na FE
        totalBetCents: totalBet,
        totalPayoutCents: totalPayout,
        ggrCents: totalBet - totalPayout,
      };
    });
  }

  async revenueByGame(opts: { from?: Date; to?: Date }) {
    const { from, to } = opts;

    const qb = this.txRepo.createQueryBuilder('t')
      .select('t.game', 'game')
      .addSelect(`SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)`, 'totalBet')
      .addSelect(`SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`, 'totalPayout');

    if (from) qb.andWhere(`t."createdAt" >= :from`, { from });
    if (to) qb.andWhere(`t."createdAt" <= :to`, { to });

    const rows = await qb
      .groupBy('t.game')
      .orderBy('t.game', 'ASC')
      .getRawMany<GameRow>();

    return rows.map(r => {
      const totalBet = Number(r.totalbet ?? 0);
      const totalPayout = Number(r.totalpayout ?? 0);
      return {
        game: r.game,                    // npr. 'slots' | 'roulette' | ...
        totalBetCents: totalBet,
        totalPayoutCents: totalPayout,
        ggrCents: totalBet - totalPayout,
      };
    });
  }
}
