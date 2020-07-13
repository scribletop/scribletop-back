import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGameTypeToGames1594641835209 implements MigrationInterface {
    name = 'AddGameTypeToGames1594641835209'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" ADD "type" smallint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "type"`);
    }

}
