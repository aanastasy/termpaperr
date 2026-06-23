import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBooks1778504700000 implements MigrationInterface {
  name = "CreateBooks1778504700000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "author" character varying(255) NOT NULL, "genre" character varying(100) NOT NULL, "rating" numeric(3,2) NOT NULL DEFAULT '0', "cover_url" character varying(2048) NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "available_spots" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3971176a4b4f8d0c9f5f38cdb8f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "books"`);
  }
}
