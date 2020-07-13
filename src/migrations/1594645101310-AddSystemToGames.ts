import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSystemToGames1594645101310 implements MigrationInterface {
    name = 'AddSystemToGames1594645101310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" ADD "systemId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_3c100b4dc4d6c717c3ccc419917"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_aa1589846fdf2416618dad480ea"`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "worldId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "partyId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_3c100b4dc4d6c717c3ccc419917" FOREIGN KEY ("worldId") REFERENCES "worlds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_aa1589846fdf2416618dad480ea" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_09280198e9acbb06b917de26a3d" FOREIGN KEY ("systemId") REFERENCES "systems"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_09280198e9acbb06b917de26a3d"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_aa1589846fdf2416618dad480ea"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_3c100b4dc4d6c717c3ccc419917"`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "partyId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "worldId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_aa1589846fdf2416618dad480ea" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_3c100b4dc4d6c717c3ccc419917" FOREIGN KEY ("worldId") REFERENCES "worlds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "systemId"`);
    }

}
