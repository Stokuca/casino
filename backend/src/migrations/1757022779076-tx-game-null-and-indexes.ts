import { MigrationInterface, QueryRunner } from 'typeorm';

export class TxGameNullAndIndexes1757022779076 implements MigrationInterface {
  name = 'TxGameNullAndIndexes1757022779076';

  public async up(q: QueryRunner): Promise<void> {
    // 1) Dozvoli NULL za gameId (initial deposit/withdraw nema igru)
    await q.query(`ALTER TABLE "transactions" ALTER COLUMN "gameId" DROP NOT NULL`);

    // 2) Indeksi za brže metrike i listinge
    await q.query(`CREATE INDEX IF NOT EXISTS "idx_tx_game_type" ON "transactions"("gameId", "type")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "idx_tx_player_created" ON "transactions"("playerId", "createdAt")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "idx_tx_created" ON "transactions"("createdAt")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "idx_tx_created"`);
    await q.query(`DROP INDEX IF EXISTS "idx_tx_player_created"`);
    await q.query(`DROP INDEX IF EXISTS "idx_tx_game_type"`);
  }
}
