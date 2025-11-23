/*
  Warnings:

  - You are about to alter the column `day` on the `Schedule` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - You are about to drop the `Interval` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Interval` DROP FOREIGN KEY `Interval_scheduleId_fkey`;

-- AlterTable
ALTER TABLE `Schedule` MODIFY `day` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Interval`;

-- CreateTable
CREATE TABLE `TimeInterval` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scheduleId` INTEGER NOT NULL,
    `open` VARCHAR(191) NOT NULL,
    `close` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TimeInterval` ADD CONSTRAINT `TimeInterval_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
