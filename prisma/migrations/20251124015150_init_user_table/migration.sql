-- AlterTable
ALTER TABLE `TimeInterval` ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `productId` INTEGER NULL,
    MODIFY `scheduleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TimeInterval` ADD CONSTRAINT `TimeInterval_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeInterval` ADD CONSTRAINT `TimeInterval_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
