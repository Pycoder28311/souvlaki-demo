/*
  Warnings:

  - You are about to drop the `Shop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Shop` DROP FOREIGN KEY `Shop_imageId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `validRadius` DECIMAL(6, 2) NULL;

-- DropTable
DROP TABLE `Shop`;
