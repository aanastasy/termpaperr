import bcrypt from "bcrypt";
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Seeds default admin. Also ensures user columns exist when the migrations
 * table was baselined without applying AddNameToUsers / AddEmailVerification.
 */
export class SeedAdmin1778600000000 implements MigrationInterface {
  name = "SeedAdmin1778600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" character varying(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token_hash" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token_expires_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "email_verified_at" = now() WHERE "email_verified_at" IS NULL`,
    );

    const passwordHash = await bcrypt.hash("admin_password", 10);
    await queryRunner.query(`
      INSERT INTO users (id, name, email, password_hash, role, email_verified_at)
      VALUES (
        uuid_generate_v4(),
        'Admin',
        'admin@gmail.com',
        '${passwordHash}',
        'admin',
        NOW()
      )
      ON CONFLICT (email) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE email = 'admin@gmail.com'`);
  }
}
