/*
  Warnings:

  - You are about to drop the column `type` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Category` DROP COLUMN `type`;

-- AlterTable
ALTER TABLE `IngCategory` ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'options';
