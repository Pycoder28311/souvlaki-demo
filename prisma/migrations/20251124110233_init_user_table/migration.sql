/*
  Warnings:

  - You are about to drop the column `alwaysClosed` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `closeHour` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `openHour` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `alwaysClosed` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `closeHour` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openHour` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Category` DROP COLUMN `alwaysClosed`,
    DROP COLUMN `closeHour`,
    DROP COLUMN `openHour`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `alwaysClosed`,
    DROP COLUMN `closeHour`,
    DROP COLUMN `openHour`;
