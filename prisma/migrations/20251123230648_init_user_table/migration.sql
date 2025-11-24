-- DropForeignKey
ALTER TABLE `TimeInterval` DROP FOREIGN KEY `TimeInterval_scheduleId_fkey`;

-- DropIndex
DROP INDEX `TimeInterval_scheduleId_fkey` ON `TimeInterval`;

-- AddForeignKey
ALTER TABLE `TimeInterval` ADD CONSTRAINT `TimeInterval_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
