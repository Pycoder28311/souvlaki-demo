/*
  Warnings:

  - You are about to drop the column `validRadius` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Shop` ADD COLUMN `validRadius` DECIMAL(6, 2) NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `validRadius`;
