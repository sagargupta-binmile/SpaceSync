import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1757662465892 implements MigrationInterface {
  name = 'InitMigration1757662465892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
  }
}
