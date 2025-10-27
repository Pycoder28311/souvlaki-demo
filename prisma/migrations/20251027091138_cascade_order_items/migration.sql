-- AlterTable
ALTER TABLE `Category` ADD COLUMN `closeHour` VARCHAR(191) NULL,
    ADD COLUMN `openHour` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `closeHour` VARCHAR(191) NULL,
    ADD COLUMN `openHour` VARCHAR(191) NULL;
