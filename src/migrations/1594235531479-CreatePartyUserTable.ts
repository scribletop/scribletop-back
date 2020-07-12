import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartyUserTable1594235531479 implements MigrationInterface {
  name = 'CreatePartyUserTable1594235531479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "party_user" ("partyId" integer NOT NULL, "userId" integer NOT NULL, "role" smallint NOT NULL, CONSTRAINT "PK_336b94adbf0cb52a429ba5aac48" PRIMARY KEY ("partyId", "userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "party_user" ADD CONSTRAINT "FK_57707249d10322e7e9aa68766e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "party_user" ADD CONSTRAINT "FK_2b4c1790770ecfb200dd4083e24" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "party_user" DROP CONSTRAINT "FK_2b4c1790770ecfb200dd4083e24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "party_user" DROP CONSTRAINT "FK_57707249d10322e7e9aa68766e2"`,
    );
    await queryRunner.query(`DROP TABLE "party_user"`);
  }
}
