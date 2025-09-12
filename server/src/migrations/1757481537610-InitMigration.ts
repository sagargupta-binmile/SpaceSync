import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1757481537610 implements MigrationInterface {
  name = 'InitMigration1757481537610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookings" ADD "deletedAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "deletedAt"`);
  }
}
