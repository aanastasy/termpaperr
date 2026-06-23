import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailVerificationToUsers1778510000000
  implements MigrationInterface
{
  name = "AddEmailVerificationToUsers1778510000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verified_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verification_token_hash" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verification_token_expires_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "email_verified_at" = now() WHERE "email_verified_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "email_verification_token_expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "email_verification_token_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "email_verified_at"`,
    );
  }
}
