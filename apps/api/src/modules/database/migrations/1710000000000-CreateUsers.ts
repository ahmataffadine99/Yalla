import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1710000000000 implements MigrationInterface {
  name = 'CreateUsers1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY,
        "email" varchar(320) NOT NULL,
        "phone_number" varchar(16) NOT NULL,
        "password_hash" varchar(256) NOT NULL,
        "email_verified_at" timestamptz,
        "email_verification_token_hash" varchar(64),
        "email_verification_expires_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_phone_number" UNIQUE ("phone_number"),
        CONSTRAINT "UQ_users_email_verification_token_hash"
          UNIQUE ("email_verification_token_hash")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
