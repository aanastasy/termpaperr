import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameToUsers1778505800000 implements MigrationInterface {
  name = "AddNameToUsers1778505800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "name" character varying(255) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
  }
}
