// backend/src/modules/operators/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { Transaction } from '../../transactions/transaction.entity';
import { Granularity } from './revenue.dto';

type PeriodRow = { period: Date; totalbet: string; totalpayout: string };
type GameAggRow = {
  gameid: string;
  gamename: string;
  totalbet?: string;
  totalpayout?: string;
  ggr?: string;
  rounds?: string;
  avgbet?: string;
  rtppercent?: string;
};

function dateTrunc(granularity: Granularity) {
  switch (granularity) {
    case Granularity.DAILY: return 'day';
    case Granularity.WEEKLY: return 'week';
    case Granularity.MONTHLY: return 'month';
  }
}

function applyRange<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
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

  // ---------------- Revenue by period ----------------
  async revenueByPeriod(opts: { granularity: Granularity; from?: Date; to?: Date }) {
    const { granularity, from, to } = opts;
    const trunc = dateTrunc(granularity);

    const qb = this.txRepo
      .createQueryBuilder('t')
      .select(`DATE_TRUNC('${trunc}', t."createdAt")`, 'period')
      .addSelect(
        `SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)`,
        'totalBet',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`,
        'totalPayout',
      )
      .groupBy('period')
      .orderBy('period', 'ASC');

    applyRange(qb, from, to);

    const rows = await qb.getRawMany<PeriodRow>();

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

  // ---------------- Revenue by game (pie) ----------------
  async revenueByGame(opts: { from?: Date; to?: Date }) {
    const { from, to } = opts;

    const qb = this.txRepo
      .createQueryBuilder('t')
      .innerJoin('t.game', 'g')
      .select('g.id', 'gameId')
      .addSelect('g.name', 'gameName')
      .addSelect(
        `SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)`,
        'totalBet',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`,
        'totalPayout',
      )
      .groupBy('g.id')
      .addGroupBy('g.name')
      .orderBy('g.name', 'ASC');

    applyRange(qb, from, to);

    const rows = await qb.getRawMany<GameAggRow>();
    return rows.map((r) => {
      const totalBet = Number(r.totalbet ?? 0);
      const totalPayout = Number(r.totalpayout ?? 0);
      return {
        gameId: r.gameid,
        gameName: r.gamename,
        totalBetCents: totalBet,
        totalPayoutCents: totalPayout,
        ggrCents: totalBet - totalPayout,
      };
    });
  }

  // ---------------- Top profitable games ----------------
  async topProfitableGames(limit: number, from?: Date, to?: Date) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .innerJoin('t.game', 'g')
      .select('g.id', 'gameId')
      .addSelect('g.name', 'gameName')
      .addSelect(
        `SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)`,
        'totalBet',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`,
        'totalPayout',
      )
      .groupBy('g.id')
      .addGroupBy('g.name')
      .orderBy(
        `SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END)
         - SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)`,
        'DESC',
      )
      .limit(limit);

    applyRange(qb, from, to);

    const rows = await qb.getRawMany<GameAggRow>();
    return rows.map((r) => {
      const totalBet = Number(r.totalbet ?? 0);
      const totalPayout = Number(r.totalpayout ?? 0);
      return {
        gameId: r.gameid,
        gameName: r.gamename,
        totalBetCents: totalBet,
        totalPayoutCents: totalPayout,
        ggrCents: totalBet - totalPayout,
      };
    });
  }

  // ---------------- Most popular games (#bets) ----------------
  async mostPopularGames(limit: number, from?: Date, to?: Date) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .innerJoin('t.game', 'g')
      .select('g.id', 'gameId')
      .addSelect('g.name', 'gameName')
      .addSelect(
        `COUNT(*) FILTER (WHERE t.type = 'BET')`,
        'rounds',
      )
      .groupBy('g.id')
      .addGroupBy('g.name')
      .orderBy(`COUNT(*) FILTER (WHERE t.type = 'BET')`, 'DESC')
      .limit(limit);

    applyRange(qb, from, to);

    const rows = await qb.getRawMany<GameAggRow>();
    return rows.map((r) => ({
      gameId: r.gameid,
      gameName: r.gamename,
      rounds: Number(r.rounds ?? 0),
    }));
  }

  // ---------------- Average bet per game ----------------
  async avgBetPerGame(from?: Date, to?: Date) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .innerJoin('t.game', 'g')
      .select('g.id', 'gameId')
      .addSelect('g.name', 'gameName')
      .addSelect(
        `AVG(CASE WHEN t.type = 'BET' THEN t."amountCents" END)`,
        'avgBet',
      )
      .groupBy('g.id')
      .addGroupBy('g.name')
      .orderBy('g.name', 'ASC');

    applyRange(qb, from, to);

    const rows = await qb.getRawMany<GameAggRow>();
    return rows.map((r) => ({
      gameId: r.gameid,
      gameName: r.gamename,
      avgBetCents: Math.round(Number(r.avgbet ?? 0)),
    }));
  }

  // ---------------- Actual RTP per game ----------------
  async rtpPerGame(from?: Date, to?: Date) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .innerJoin('t.game', 'g')
      .select('g.id', 'gameId')
      .addSelect('g.name', 'gameName')
      .addSelect(
        // RTP (%) = totalPayout / totalBet * 100  (zaokruženo na 2 decimale)
        `CASE
           WHEN SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END) = 0
           THEN 0
           ELSE ROUND(
             SUM(CASE WHEN t.type = 'PAYOUT' THEN t."amountCents" ELSE 0 END)
             * 100.0
             / NULLIF(SUM(CASE WHEN t.type = 'BET' THEN t."amountCents" ELSE 0 END), 0),
             2
           )
         END`,
        'rtpPercent',
      )
      .groupBy('g.id')
      .addGroupBy('g.name')
      .orderBy('g.name', 'ASC');

    applyRange(qb, from, to);

    const rows = await qb.getRawMany<GameAggRow>();
    return rows.map((r) => ({
      gameId: r.gameid,
      gameName: r.gamename,
      rtpPercent: Number(r.rtppercent ?? 0),
    }));
  }
}
