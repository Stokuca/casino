import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Player } from '../players/player.entity';
import { Transaction } from '../transactions/transaction.entity';
import { TxType } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(private dataSource: DataSource) {}

  async register(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);

    return this.dataSource.transaction(async (q) => {
      const playerRepo = q.getRepository(Player);
      const txRepo = q.getRepository(Transaction);

      // 1. Kreiraj playera
      const player = await playerRepo.save({ email, passwordHash: hash });

      // 2. Inicijalni balans = $1000 = 100_000 centi
      const newBalance = BigInt(100_000);

      await playerRepo.update(player.id, {
        balanceCents: newBalance.toString(),
      });

      // 3. Snimi inicijalni deposit transakciju
      await txRepo.save({
        playerId: player.id,
        type: TxType.DEPOSIT,  
        amountCents: newBalance.toString(),
        balanceAfterCents: newBalance.toString(),
        meta: { reason: 'initial_credit' },
      });

      return player;
    });
  }
}
