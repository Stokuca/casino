// backend/src/modules/operators/dto/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Granularity } from './revenue.dto';
import { Transaction } from '../../transactions/transaction.entity';
import { Game } from '../../games/game.entity';

type ByPeriodRow = { period: Date; totalbet: string; totalpayout: string };
type GameRow = {
  gamecode: string | null;
  gamename: string | null;
  totalbet: string;
  totalpayout: string;
};
type PopularRow = { gamecode: string | null; gamename: string | null; rounds: string };
type AvgBetRow = { gamecode: string | null; gamename: string | null; avgbet: string };
type RtpRow = { gamecode: string | null; gamename: string | null; rtp: string };

function toPgDateTrunc(granularity: Granularity) {
  switch (granularity) {
    case Granularity.DAILY:
      return 'day';
    case Granularity.WEEKLY:
      return 'week';
    case Granularity.MONTHLY:
      return 'month';
  }
}

/** prostan helper bez generika (nema TS greške) */
function applyRange(
  qb: SelectQueryBuilder<any>,
  from?: Date,
  to?: Date,
  alias = 't',
) {
  if (from) qb.andWhere(`${alias}."createdAt" >= :from`, { from });
  if (to) qb.andWhere(`${alias}."createdAt" <= :to`, { to });
  return qb;
}

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  // ---------------------------------------------------------
  // 1) Revenue by period (daily/weekly/monthly)
  // ---------------------------------------------------------
  async revenueByPeriod(opts: {
    granularity: Granularity;
    from?: Date;
    to?: Date;
  }) {
    const { granularity, from, to } = opts;
    const pgTrunc = toPgDateTrunc(granularity);

    const qb = this.txRepo
      .createQueryBuilder('t')
      .select(`DATE_TRUNC('${pgTrunc}', t."createdAt")`, 'period')
      .addSelect(
        `SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)`,
        'totalBet',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`,
        'totalPayout',
      );

    applyRange(qb, from, to);

    const rows = await qb
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany<ByPeriodRow>();

    return rows.map((r) => {
      const totalBet = Number(r.totalbet ?? 0);
      const totalPayout = Number(r.totalpayout ?? 0);
      return {
        period: r.period,
        totalBetCents: totalBet,
        totalPayoutCents: totalPayout,
        ggrCents: totalBet - totalPayout,
      };
    });
  }

  // ---------------------------------------------------------
  // 2) Revenue by game (pie chart) – JOIN na Game da vrati code/name
  // ---------------------------------------------------------
  async revenueByGame(opts: { from?: Date; to?: Date }) {
    const { from, to } = opts;

    const qb = this.txRepo
      .createQueryBuilder('t')
      .leftJoin(Game, 'g', 'g.id = t."gameId"')
      .select('g.code', 'gameCode')
      .addSelect('g.name', 'gameName')
      .addSelect(
        `SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)`,
        'totalBet',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`,
        'totalPayout',
      );

    applyRange(qb, from, to);

    const rows = await qb
      .groupBy('g.code')
      .addGroupBy('g.name')
      .orderBy('g.code', 'ASC')
      .getRawMany<GameRow>();

    return rows.map((r) => {
      const bet = Number(r.totalbet ?? 0);
      const payout = Number(r.totalpayout ?? 0);
      return {
        gameCode: r.gamecode,     // npr. 'slots' | 'roulette' | ...
        gameName: r.gamename,     // 'Slots' | 'Roulette' | ...
        totalBetCents: bet,
        totalPayoutCents: payout,
        ggrCents: bet - payout,
      };
    });
  }

  // ---------------------------------------------------------
  // 3) Games metrics
  // ---------------------------------------------------------

  // 3.1) Top profitable (po GGR desc)
  async topProfitableGames(limit = 5, from?: Date, to?: Date) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .leftJoin(Game, 'g', 'g.id = t."gameId"')
      .select('g.code', 'gameCode')
      .addSelect('g.name', 'gameName')
      .addSelect(
        `SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)`,
        'totalBet',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`,
        'totalPayout',
      );

    applyRange(qb, from, to);

    const rows = await qb
      .groupBy('g.code')
      .addGroupBy('g.name')
      .orderBy(
        `(SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END) - SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END))`,
        'DESC',
      )
      .limit(Math.max(1, Number(limit || 5)))
      .getRawMany<GameRow>();

    return rows.map((r) => {
      const bet = Number(r.totalbet ?? 0);
      const payout = Number(r.totalpayout ?? 0);
      return {
        gameCode: r.gamecode,
        gameName: r.gamename,
        totalBetCents: bet,
        totalPayoutCents: payout,
        ggrCents: bet - payout,
      };
    });
  }

  // 3.2) Most popular (broj transakcija/rundi)
  async mostPopularGames(limit = 5, from?: Date, to?: Date) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .leftJoin(Game, 'g', 'g.id = t."gameId"')
      .select('g.code', 'gameCode')
      .addSelect('g.name', 'gameName')
      .addSelect('COUNT(*)', 'rounds');

    applyRange(qb, from, to);

    const rows = await qb
      .groupBy('g.code')
      .addGroupBy('g.name')
      .orderBy('COUNT(*)', 'DESC')
      .limit(Math.max(1, Number(limit || 5)))
      .getRawMany<PopularRow>();

    return rows.map((r) => ({
      gameCode: r.gamecode,
      gameName: r.gamename,
      rounds: Number(r.rounds ?? 0),
    }));
  }

  // 3.3) Average bet per game
  async avgBetPerGame(from?: Date, to?: Date) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .leftJoin(Game, 'g', 'g.id = t."gameId"')
      .select('g.code', 'gameCode')
      .addSelect('g.name', 'gameName')
      .addSelect(
        `AVG(CASE WHEN t.type = 'BET' THEN t."amountCents" END)`,
        'avgBet',
      );

    applyRange(qb, from, to);

    const rows = await qb
      .groupBy('g.code')
      .addGroupBy('g.name')
      .getRawMany<AvgBetRow>();

    return rows.map((r) => ({
      gameCode: r.gamecode,
      gameName: r.gamename,
      avgBetCents: Math.round(Number(r.avgbet ?? 0)),
    }));
  }

  // 3.4) RTP per game (actual = PAYOUT / BET * 100)
  async rtpPerGame(from?: Date, to?: Date) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .leftJoin(Game, 'g', 'g.id = t."gameId"')
      .select('g.code', 'gameCode')
      .addSelect('g.name', 'gameName')
      .addSelect(
        `SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)
         / NULLIF(SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END), 0) * 100`,
        'rtp',
      );

    applyRange(qb, from, to);

    const rows = await qb
      .groupBy('g.code')
      .addGroupBy('g.name')
      .getRawMany<RtpRow>();

    return rows.map((r) => ({
      gameCode: r.gamecode,
      gameName: r.gamename,
      rtpPercent: Number(r.rtp ?? 0), // npr. 96.12
    }));
  }
}
