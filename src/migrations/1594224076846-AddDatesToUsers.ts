import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatesToUsers1594224076846 implements MigrationInterface {
  name = 'AddDatesToUsers1594224076846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "dateCreated" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "users" ADD "dateUpdated" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dateUpdated"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dateCreated"`);
  }

}
