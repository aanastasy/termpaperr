import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRegistrations1778505200000 implements MigrationInterface {
  name = "CreateRegistrations1778505200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."registrations_status_enum" AS ENUM('active', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "registrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "book_id" uuid NOT NULL, "payment_method" character varying(100) NOT NULL, "status" "public"."registrations_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_registrations_user_book" UNIQUE ("user_id", "book_id"), CONSTRAINT "PK_5f3f7c2f0f76f443f96a2f31f45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" ADD CONSTRAINT "FK_registrations_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" ADD CONSTRAINT "FK_registrations_book" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "FK_registrations_book"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "FK_registrations_user"`,
    );
    await queryRunner.query(`DROP TABLE "registrations"`);
    await queryRunner.query(`DROP TYPE "public"."registrations_status_enum"`);
  }
}
