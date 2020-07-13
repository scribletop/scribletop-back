import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorldsAndGames1594633618661 implements MigrationInterface {
  name = 'CreateWorldsAndGames1594633618661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "worlds" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "image" character varying, CONSTRAINT "UQ_fd29fd0ac580af0bd067b2f43ba" UNIQUE ("slug"), CONSTRAINT "PK_8b447f7a2b28d3567db893ae7a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "games" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "name" character varying NOT NULL, "worldId" integer, "partyId" integer, CONSTRAINT "UQ_095bbaa4f028fa5a03e37f631d6" UNIQUE ("slug"), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD CONSTRAINT "FK_3c100b4dc4d6c717c3ccc419917" FOREIGN KEY ("worldId") REFERENCES "worlds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD CONSTRAINT "FK_aa1589846fdf2416618dad480ea" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_aa1589846fdf2416618dad480ea"`);
    await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_3c100b4dc4d6c717c3ccc419917"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TABLE "worlds"`);
  }
}
