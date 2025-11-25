-- AlterTable
ALTER TABLE `TimeInterval` ADD COLUMN `overrideId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Override` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Override_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TimeInterval` ADD CONSTRAINT `TimeInterval_overrideId_fkey` FOREIGN KEY (`overrideId`) REFERENCES `Override`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
