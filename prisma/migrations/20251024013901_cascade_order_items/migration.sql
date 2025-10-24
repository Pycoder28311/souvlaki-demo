/*
  Warnings:

  - You are about to alter the column `distanceToDestination` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(6,2)`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `distanceToDestination` DECIMAL(6, 2) NULL;
