import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOperators1756983833779 implements MigrationInterface {
  name = 'CreateOperators1756983833779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext;`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "operators" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" citext UNIQUE NOT NULL,
        "passwordHash" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'admin',
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "operators";`);
  }
}
