/*
  Warnings:

  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `image`,
    ADD COLUMN `imageId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Product_imageId_key` ON `Product`(`imageId`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
