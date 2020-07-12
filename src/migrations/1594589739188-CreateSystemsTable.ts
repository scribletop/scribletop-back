import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemsTable1594589739188 implements MigrationInterface {
  name = 'CreateSystemsTable1594589739188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "systems" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "image" character varying NULL, CONSTRAINT "UQ_bdaffea28a9e21e810d2cc7f675" UNIQUE ("slug"), CONSTRAINT "PK_aec3139aedeb09c5ae27f2c94d3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "systems"`);
  }
}
