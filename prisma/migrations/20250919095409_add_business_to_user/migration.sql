/*
  Warnings:

  - Added the required column `senderEmail` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderName` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropIndex
DROP INDEX `Message_receiverId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_senderId_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `senderEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `senderName` VARCHAR(191) NOT NULL,
    ADD COLUMN `senderPhone` VARCHAR(191) NULL,
    ADD COLUMN `subject` VARCHAR(191) NOT NULL,
    MODIFY `senderId` INTEGER NULL,
    MODIFY `receiverId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
