import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(@InjectRepository(Transaction) private readonly trepo: Repository<Transaction>) {}

  async listForPlayer(playerId: string, q: QueryTransactionsDto) {
    const qb = this.trepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.game', 'g')
      .where('t.playerId = :playerId', { playerId });

    if (q.type) qb.andWhere('t.type = :type', { type: q.type });
    if (q.game) qb.andWhere('g.code = :game', { game: q.game });
    if (q.from) qb.andWhere('t.createdAt >= :from', { from: new Date(q.from) });
    if (q.to)   qb.andWhere('t.createdAt <= :to',   { to: new Date(q.to) });

    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const [items, total] = await qb
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      page,
      limit,
      total,
      items: items.map((t) => ({
        id: t.id,
        type: t.type,
        amountCents: t.amountCents,
        balanceAfterCents: t.balanceAfterCents,
        game: t.game?.code ?? null,
        createdAt: t.createdAt,
      })),
    };
  }
}
