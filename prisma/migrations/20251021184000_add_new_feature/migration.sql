/*
  Warnings:

  - You are about to drop the column `productOrderItemId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the `ProductOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductOrderItemIngredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductOrderItemSelectedOptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_productOrderItemId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductOrderItem` DROP FOREIGN KEY `ProductOrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductOrderItem` DROP FOREIGN KEY `ProductOrderItem_productOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductOrderItemIngredient` DROP FOREIGN KEY `ProductOrderItemIngredient_ingredientId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductOrderItemIngredient` DROP FOREIGN KEY `ProductOrderItemIngredient_productOrderItemId_fkey`;

-- DropForeignKey
ALTER TABLE `_ProductOptions` DROP FOREIGN KEY `_ProductOptions_B_fkey`;

-- DropForeignKey
ALTER TABLE `_ProductOrderItemSelectedOptions` DROP FOREIGN KEY `_ProductOrderItemSelectedOptions_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ProductOrderItemSelectedOptions` DROP FOREIGN KEY `_ProductOrderItemSelectedOptions_B_fkey`;

-- DropIndex
DROP INDEX `Favorite_productOrderItemId_fkey` ON `Favorite`;

-- AlterTable
ALTER TABLE `Favorite` DROP COLUMN `productOrderItemId`,
    ADD COLUMN `orderItemId` INTEGER NULL;

-- DropTable
DROP TABLE `ProductOrderItem`;

-- DropTable
DROP TABLE `ProductOrderItemIngredient`;

-- DropTable
DROP TABLE `_ProductOrderItemSelectedOptions`;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `imageId` INTEGER NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL,
    `comment` VARCHAR(191) NULL,

    UNIQUE INDEX `OrderItem_imageId_key`(`imageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItemIngredient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `ingredientId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    `price` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OrderItemSelectedOptions` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OrderItemSelectedOptions_AB_unique`(`A`, `B`),
    INDEX `_OrderItemSelectedOptions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `ProductOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemIngredient` ADD CONSTRAINT `OrderItemIngredient_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemIngredient` ADD CONSTRAINT `OrderItemIngredient_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductOptions` ADD CONSTRAINT `_ProductOptions_B_fkey` FOREIGN KEY (`B`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrderItemSelectedOptions` ADD CONSTRAINT `_OrderItemSelectedOptions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrderItemSelectedOptions` ADD CONSTRAINT `_OrderItemSelectedOptions_B_fkey` FOREIGN KEY (`B`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
