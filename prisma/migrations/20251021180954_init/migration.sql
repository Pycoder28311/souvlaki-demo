/*
  Warnings:

  - You are about to drop the column `orderItemId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItemIngredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrderItemSelectedOptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_orderItemId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItemIngredient` DROP FOREIGN KEY `OrderItemIngredient_ingredientId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItemIngredient` DROP FOREIGN KEY `OrderItemIngredient_orderItemId_fkey`;

-- DropForeignKey
ALTER TABLE `_OrderItemSelectedOptions` DROP FOREIGN KEY `_OrderItemSelectedOptions_A_fkey`;

-- DropForeignKey
ALTER TABLE `_OrderItemSelectedOptions` DROP FOREIGN KEY `_OrderItemSelectedOptions_B_fkey`;

-- DropForeignKey
ALTER TABLE `_ProductOptions` DROP FOREIGN KEY `_ProductOptions_B_fkey`;

-- DropIndex
DROP INDEX `Favorite_orderItemId_fkey` ON `Favorite`;

-- AlterTable
ALTER TABLE `Favorite` DROP COLUMN `orderItemId`,
    ADD COLUMN `productOrderItemId` INTEGER NULL;

-- DropTable
DROP TABLE `Order`;

-- DropTable
DROP TABLE `OrderItem`;

-- DropTable
DROP TABLE `OrderItemIngredient`;

-- DropTable
DROP TABLE `_OrderItemSelectedOptions`;

-- CreateTable
CREATE TABLE `ProductOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP() + INTERVAL 3 HOUR),
    `updatedAt` DATETIME(3) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductOrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productOrderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `imageId` INTEGER NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL,
    `comment` VARCHAR(191) NULL,

    UNIQUE INDEX `ProductOrderItem_imageId_key`(`imageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductOrderItemIngredient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productOrderItemId` INTEGER NOT NULL,
    `ingredientId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    `price` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProductOrderItemSelectedOptions` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProductOrderItemSelectedOptions_AB_unique`(`A`, `B`),
    INDEX `_ProductOrderItemSelectedOptions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductOrder` ADD CONSTRAINT `ProductOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOrderItem` ADD CONSTRAINT `ProductOrderItem_productOrderId_fkey` FOREIGN KEY (`productOrderId`) REFERENCES `ProductOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOrderItem` ADD CONSTRAINT `ProductOrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOrderItemIngredient` ADD CONSTRAINT `ProductOrderItemIngredient_productOrderItemId_fkey` FOREIGN KEY (`productOrderItemId`) REFERENCES `ProductOrderItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOrderItemIngredient` ADD CONSTRAINT `ProductOrderItemIngredient_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_productOrderItemId_fkey` FOREIGN KEY (`productOrderItemId`) REFERENCES `ProductOrderItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductOptions` ADD CONSTRAINT `_ProductOptions_B_fkey` FOREIGN KEY (`B`) REFERENCES `ProductOrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductOrderItemSelectedOptions` ADD CONSTRAINT `_ProductOrderItemSelectedOptions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductOrderItemSelectedOptions` ADD CONSTRAINT `_ProductOrderItemSelectedOptions_B_fkey` FOREIGN KEY (`B`) REFERENCES `ProductOrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
