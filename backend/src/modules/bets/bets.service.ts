import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Player } from '../players/player.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Game } from '../games/game.entity';
import { Outcome, TxType } from '../common/enums';

@Injectable()
export class BetsService {
  constructor(private readonly ds: DataSource) {}

  async play(playerId: string, gameCode: string, amountStr: string, outcome: Outcome) {
    const betAmount = BigInt(amountStr);
    const winMultiplier = 2n; // mock isplata na win (možeš kasnije po igri)

    return this.ds.transaction(async (q) => {
      const prepo = q.getRepository(Player);
      const trepo = q.getRepository(Transaction);
      const grepo = q.getRepository(Game);

      const game = await grepo.findOne({ where: { code: gameCode as any } });
      if (!game) throw new BadRequestException('Game not found');

      const p = await prepo.findOneByOrFail({ id: playerId });
      const current = BigInt(p.balanceCents);
      if (current < betAmount) throw new BadRequestException('Insufficient funds');

      // 1) BET (oduzmi)
      const afterBet = current - betAmount;
      await prepo.update(p.id, { balanceCents: afterBet.toString() });
      await trepo.save({
        playerId,
        gameId: game.id,
        type: TxType.BET,
        amountCents: betAmount.toString(),
        balanceAfterCents: afterBet.toString(),
        meta: { game: game.code },
      });

      // 2) Ako WIN -> PAYOUT (dodaj)
      let finalBal = afterBet;
      if (outcome === Outcome.WIN) {
        const payout = betAmount * winMultiplier;
        finalBal = afterBet + payout;

        await prepo.update(p.id, { balanceCents: finalBal.toString() });
        await trepo.save({
          playerId,
          gameId: game.id,
          type: TxType.PAYOUT,
          amountCents: payout.toString(),
          balanceAfterCents: finalBal.toString(),
          meta: { game: game.code, outcome: 'WIN', winMultiplier: winMultiplier.toString() },
        });
      }

      return { balanceCents: finalBal.toString(), balance: Number(finalBal) / 100 };
    });
  }
}
