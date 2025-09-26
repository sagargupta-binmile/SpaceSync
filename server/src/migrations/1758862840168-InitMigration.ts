import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1758862840168 implements MigrationInterface {
    name = 'InitMigration1758862840168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`rooms\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`capacity\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bookings\` (\`id\` varchar(36) NOT NULL, \`startTime\` datetime NOT NULL, \`endTime\` datetime NOT NULL, \`deletedAt\` datetime(6) NULL, \`recurrenceRule\` text NULL, \`recurrenceEndDate\` datetime NULL, \`recurrenceId\` char(36) NULL, \`slackChannelId\` varchar(100) NULL, \`slackMessageTs\` varchar(50) NULL, \`user_id\` varchar(36) NULL, \`room_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 0, \`role\` varchar(50) NULL, \`isBlocked\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`push_subscriptions\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`endpoint\` text NOT NULL, \`p256dh\` text NOT NULL, \`auth\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_64cd97487c5c42806458ab5520c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bookings\` ADD CONSTRAINT \`FK_0b0fc32fe6bd0119e281628df7a\` FOREIGN KEY (\`room_id\`) REFERENCES \`rooms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_0b0fc32fe6bd0119e281628df7a\``);
        await queryRunner.query(`ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_64cd97487c5c42806458ab5520c\``);
        await queryRunner.query(`DROP TABLE \`push_subscriptions\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`bookings\``);
        await queryRunner.query(`DROP TABLE \`rooms\``);
    }

}
