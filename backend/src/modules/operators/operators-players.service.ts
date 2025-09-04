import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { Repository } from 'typeorm';
import { Player } from '../players/player.entity';
import { QueryPlayersDto } from './dto/query-players.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { ActivePlayersDto } from './dto/active-players.dto';

@Injectable()
export class OperatorsPlayersService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
  ) {}

  async leaderboard(dto: LeaderboardDto) {
    const limit = Math.min(dto.limit ?? 10, 100); // hard cap
  const qb = this.txRepo.createQueryBuilder('t')
    .select('t.playerId', 'playerId')
    .addSelect(`SUM(CASE WHEN t.type = 'BET' THEN t.amountCents ELSE 0 END)`, 'betCents')
    .addSelect(`SUM(CASE WHEN t.type = 'PAYOUT' THEN t.amountCents ELSE 0 END)`, 'payoutCents')
    .addSelect(
      `SUM(CASE WHEN t.type = 'BET' THEN t.amountCents ELSE 0 END)
       - SUM(CASE WHEN t.type = 'PAYOUT' THEN t.amountCents ELSE 0 END)`,
      'ggrCents',
    )
    .groupBy('t.playerId')
    .orderBy('"ggrCents"', 'DESC')     // << bitno: quoted alias
    .addOrderBy('t.playerId', 'ASC')   // stabilan tie-break
    .limit(limit);

    const rows = await qb.getRawMany<{ playerId: string; betCents: string; payoutCents: string; ggrCents: string }>();

    const ids = rows.map(r => r.playerId);
    const players = ids.length
      ? await this.playerRepo.createQueryBuilder('p')
          .select(['p.id', 'p.email', 'p.createdAt'])
          .where('p.id IN (:...ids)', { ids })
          .getMany()
      : [];

    const map = new Map(players.map(p => [p.id, p]));
    return rows.map(r => ({
      player: map.get(r.playerId) || { id: r.playerId },
      betCents: Number(r.betCents || 0),
      payoutCents: Number(r.payoutCents || 0),
      ggrCents: Number(r.ggrCents || 0),
    }));
  }

  async listPlayers(dto: QueryPlayersDto) {
    // clamp i defaulti
    const page  = Math.max(1, Number(dto.page ?? 1));
    const limit = Math.min(Math.max(1, Number(dto.limit ?? 10)), 100);
    const offset = (page - 1) * limit;
  
    // agregati po playeru
    const base = this.txRepo.createQueryBuilder('t')
      .select('t.playerId', 'playerId')
      .addSelect(`COUNT(*) FILTER (WHERE t.type = 'BET')`, 'betsCount')
      .addSelect(`SUM(CASE WHEN t.type = 'BET' THEN t.amountCents ELSE 0 END)`, 'betCents')
      .addSelect(`SUM(CASE WHEN t.type = 'PAYOUT' THEN t.amountCents ELSE 0 END)`, 'payoutCents')
      .addSelect(`MAX(t.createdAt)`, 'lastActiveAt')
      .groupBy('t.playerId');
  
    const wrap = this.txRepo.createQueryBuilder()
      .select('*')
      .from('(' + base.getQuery() + ')', 'agg')
      .setParameters(base.getParameters());
  
    // normalizuj sort/order
    const sortKey = String(dto.sort ?? 'revenue').toLowerCase();
    const orderDir = String(dto.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
  
    const sortCol =
      sortKey === 'revenue' ? `"betCents" - "payoutCents"` :
      sortKey === 'bets'    ? `"betsCount"` :
                              `"lastActiveAt"`;
  
    const rows = await wrap
      .orderBy(sortCol, orderDir)
      .offset(offset)
      .limit(limit)
      .getRawMany<{
        playerId: string;
        betsCount: string;
        betCents: string;
        payoutCents: string;
        lastActiveAt: string;
      }>();
  
    const totalRow = await this.txRepo.createQueryBuilder('t')
      .select('COUNT(DISTINCT t.playerId)', 'cnt')
      .getRawOne<{ cnt: string }>();
  
    const total = Number(totalRow?.cnt || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasNext = page < totalPages;
  
    const ids = rows.map(r => r.playerId);
    const players = ids.length
      ? await this.playerRepo.createQueryBuilder('p')
          .select(['p.id', 'p.email', 'p.createdAt'])
          .where('p.id IN (:...ids)', { ids })
          .getMany()
      : [];
  
    const map = new Map(players.map(p => [p.id, p]));
    const items = rows.map(r => ({
      player: map.get(r.playerId) || { id: r.playerId },
      betsCount: Number(r.betsCount || 0),
      betCents: Number(r.betCents || 0),
      payoutCents: Number(r.payoutCents || 0),
      revenueCents: Number(r.betCents || 0) - Number(r.payoutCents || 0),
      lastActiveAt: r.lastActiveAt ? new Date(r.lastActiveAt) : null,
    }));
  
    return { page, limit, total, totalPages, hasNext, items };
  }
  

  async activePlayers(dto: ActivePlayersDto) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - dto.windowDays);

    const row = await this.txRepo.createQueryBuilder('t')
      .select('COUNT(DISTINCT t.playerId)', 'active')
      .where(`t.type IN ('BET','PAYOUT')`)
      .andWhere('t.createdAt >= :since', { since })
      .getRawOne<{ active: string }>();

    return { windowDays: dto.windowDays, activePlayers: Number(row?.active || 0), since };
  }
}
