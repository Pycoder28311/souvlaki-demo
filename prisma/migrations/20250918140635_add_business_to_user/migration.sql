-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerified` DATETIME(3) NULL,
    MODIFY `name` VARCHAR(191) NULL;
