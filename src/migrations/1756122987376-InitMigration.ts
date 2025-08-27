import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1756122987376 implements MigrationInterface {
    name = 'InitMigration1756122987376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_673eda59a23ddc4577902c4d8d4"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_673eda59a23ddc4577902c4d8d4" FOREIGN KEY ("userIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_673eda59a23ddc4577902c4d8d4"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_673eda59a23ddc4577902c4d8d4" FOREIGN KEY ("userIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
