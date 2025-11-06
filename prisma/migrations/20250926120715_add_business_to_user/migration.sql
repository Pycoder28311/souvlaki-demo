-- AlterTable
ALTER TABLE `IngCategory` ADD COLUMN `isRequired` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Options` ADD COLUMN `isRequired` BOOLEAN NOT NULL DEFAULT false;
