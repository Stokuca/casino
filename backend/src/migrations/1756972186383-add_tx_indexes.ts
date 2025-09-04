import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTxIndexes1756972186383 implements MigrationInterface {
  name = 'AddTxIndexes1756972186383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_tx_player_created
      ON transactions ("playerId", "createdAt" DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_tx_type
      ON transactions (type);
    `);

    // Ako želiš i uniformno ime za gameId (nije obavezno, već imaš jedan index):
    // await queryRunner.query(`
    //   CREATE INDEX IF NOT EXISTS ix_tx_game
    //   ON transactions ("gameId");
    // `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Ako si dodao ix_tx_game, spusti i njega:
    // await queryRunner.query('DROP INDEX IF EXISTS ix_tx_game;');
    await queryRunner.query('DROP INDEX IF EXISTS ix_tx_type;');
    await queryRunner.query('DROP INDEX IF EXISTS ix_tx_player_created;');
  }
}
