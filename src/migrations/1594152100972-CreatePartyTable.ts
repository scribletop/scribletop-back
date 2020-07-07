import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartyTable1594152100972 implements MigrationInterface {
  name = 'CreatePartyTable1594152100972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "parties" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_af8fdeb394b9ffce3037dc1ac4f" UNIQUE ("slug"), CONSTRAINT "PK_da698299dca60d55f0050dde935" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "parties"`);
  }
}
