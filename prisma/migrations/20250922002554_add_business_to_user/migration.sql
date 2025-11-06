/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `imageId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `OrderItem_imageId_key` ON `OrderItem`(`imageId`);
