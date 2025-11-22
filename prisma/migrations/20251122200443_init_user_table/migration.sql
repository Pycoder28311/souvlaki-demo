/*
  Warnings:

  - A unique constraint covering the columns `[day]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Schedule_day_key` ON `Schedule`(`day`);
