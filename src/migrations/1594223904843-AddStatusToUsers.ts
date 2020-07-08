import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToUsers1594223904843 implements MigrationInterface {
  name = 'AddStatusToUsers1594223904843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" smallint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
  }
}
