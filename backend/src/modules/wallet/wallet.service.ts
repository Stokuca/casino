import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Player } from '../players/player.entity';
import { Transaction } from '../transactions/transaction.entity';
import { TxType } from '../common/enums';

@Injectable()
export class WalletService {
  constructor(private readonly ds: DataSource) {}

  async deposit(playerId: string, amountCentsStr: string) {
    const amount = BigInt(amountCentsStr);

    return this.ds.transaction(async (q) => {
      const prepo = q.getRepository(Player);
      const trepo = q.getRepository(Transaction);

      const p = await prepo.findOneByOrFail({ id: playerId });
      const newBal = BigInt(p.balanceCents) + amount;

      await prepo.update(p.id, { balanceCents: newBal.toString() });
      await trepo.save({
        playerId,
        type: TxType.DEPOSIT,
        amountCents: amount.toString(),
        balanceAfterCents: newBal.toString(),
        meta: { reason: 'manual_deposit' },
      });

      return { balanceCents: newBal.toString(), balance: Number(newBal) / 100 };
    });
  }

  async withdraw(playerId: string, amountCentsStr: string) {
    const amount = BigInt(amountCentsStr);

    return this.ds.transaction(async (q) => {
      const prepo = q.getRepository(Player);
      const trepo = q.getRepository(Transaction);

      const p = await prepo.findOneByOrFail({ id: playerId });
      const current = BigInt(p.balanceCents);
      if (current < amount) throw new BadRequestException('Insufficient funds');

      const newBal = current - amount;

      await prepo.update(p.id, { balanceCents: newBal.toString() });
      await trepo.save({
        playerId,
        type: TxType.WITHDRAWAL,
        amountCents: amount.toString(),
        balanceAfterCents: newBal.toString(),
        meta: { reason: 'manual_withdraw' },
      });

      return { balanceCents: newBal.toString(), balance: Number(newBal) / 100 };
    });
  }
}
