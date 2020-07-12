import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatesToEntities1594579442527 implements MigrationInterface {
  name = 'AddDatesToEntities1594579442527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parties" ADD "dateCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "parties" ADD "dateUpdated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "party_user" ADD "dateCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "party_user" ADD "dateUpdated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "party_user" DROP COLUMN "dateUpdated"`);
    await queryRunner.query(`ALTER TABLE "party_user" DROP COLUMN "dateCreated"`);
    await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "dateUpdated"`);
    await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "dateCreated"`);
  }
}
