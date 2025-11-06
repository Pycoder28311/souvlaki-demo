/*
  Warnings:

  - You are about to drop the `_OptionsToOrderItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_OptionsToOrderItem` DROP FOREIGN KEY `_OptionsToOrderItem_A_fkey`;

-- DropForeignKey
ALTER TABLE `_OptionsToOrderItem` DROP FOREIGN KEY `_OptionsToOrderItem_B_fkey`;

-- DropTable
DROP TABLE `_OptionsToOrderItem`;

-- CreateTable
CREATE TABLE `OrderItemOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `optionId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItemOption` ADD CONSTRAINT `OrderItemOption_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemOption` ADD CONSTRAINT `OrderItemOption_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `Options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
