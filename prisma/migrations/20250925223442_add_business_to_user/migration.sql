/*
  Warnings:

  - You are about to drop the column `answer` on the `Options` table. All the data in the column will be lost.
  - Added the required column `question` to the `Options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Options` DROP COLUMN `answer`,
    ADD COLUMN `question` VARCHAR(191) NOT NULL;
