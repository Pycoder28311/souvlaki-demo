-- AlterTable
ALTER TABLE `Category` ADD COLUMN `alwaysClosed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `alwaysClosed` BOOLEAN NOT NULL DEFAULT false;
