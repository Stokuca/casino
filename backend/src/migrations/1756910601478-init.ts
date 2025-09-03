import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756910601478 implements MigrationInterface {
    name = 'Init1756910601478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "operators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" citext NOT NULL, "passwordHash" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'admin', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1570f3d85c3ff08bb99815897a2" UNIQUE ("email"), CONSTRAINT "PK_3d02b3692836893720335a79d1b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" citext NOT NULL, "passwordHash" character varying NOT NULL, "balanceCents" bigint NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3abeb86b19703d782f0beff84c0" UNIQUE ("email"), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3abeb86b19703d782f0beff84c" ON "players" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."game_code" AS ENUM('slots', 'roulette', 'blackjack')`);
        await queryRunner.query(`CREATE TABLE "games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" "public"."game_code" NOT NULL, "name" character varying NOT NULL, "rtpTheoretical" numeric(5,2) NOT NULL, CONSTRAINT "UQ_6048911d5f44406ad25e44eaaed" UNIQUE ("code"), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerId" uuid NOT NULL, "gameId" uuid NOT NULL, "stakeCents" bigint NOT NULL, "outcome" character varying NOT NULL, "payoutCents" bigint NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7ca91a6a39623bd5c21722bcedd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8638a5a8e77e9055d12ac50bab" ON "bets" ("playerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_92cef011d2afac3ce58583d6f1" ON "bets" ("gameId") `);
        await queryRunner.query(`CREATE INDEX "IDX_df40819eb0eb71d2cc7d73cea8" ON "bets" ("createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."tx_type" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'BET', 'PAYOUT')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerId" uuid NOT NULL, "gameId" uuid, "type" "public"."tx_type" NOT NULL, "amountCents" bigint NOT NULL, "balanceAfterCents" bigint NOT NULL, "meta" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3f4996e03c8fc7a32951a486af" ON "transactions" ("playerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f4661b115874384e6f0da3719e" ON "transactions" ("gameId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e744417ceb0b530285c08f3865" ON "transactions" ("createdAt") `);
        await queryRunner.query(`ALTER TABLE "bets" ADD CONSTRAINT "FK_8638a5a8e77e9055d12ac50bab7" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bets" ADD CONSTRAINT "FK_92cef011d2afac3ce58583d6f1a" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_3f4996e03c8fc7a32951a486af3" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_f4661b115874384e6f0da3719ed" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_f4661b115874384e6f0da3719ed"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_3f4996e03c8fc7a32951a486af3"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "FK_92cef011d2afac3ce58583d6f1a"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "FK_8638a5a8e77e9055d12ac50bab7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e744417ceb0b530285c08f3865"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f4661b115874384e6f0da3719e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3f4996e03c8fc7a32951a486af"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."tx_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df40819eb0eb71d2cc7d73cea8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92cef011d2afac3ce58583d6f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8638a5a8e77e9055d12ac50bab"`);
        await queryRunner.query(`DROP TABLE "bets"`);
        await queryRunner.query(`DROP TABLE "games"`);
        await queryRunner.query(`DROP TYPE "public"."game_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3abeb86b19703d782f0beff84c"`);
        await queryRunner.query(`DROP TABLE "players"`);
        await queryRunner.query(`DROP TABLE "operators"`);
    }

}
