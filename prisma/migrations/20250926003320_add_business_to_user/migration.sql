/*
  Warnings:

  - You are about to drop the `OrderItemOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderItemOption` DROP FOREIGN KEY `OrderItemOption_optionId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItemOption` DROP FOREIGN KEY `OrderItemOption_orderItemId_fkey`;

-- DropTable
DROP TABLE `OrderItemOption`;

-- CreateTable
CREATE TABLE `_ProductOptions` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProductOptions_AB_unique`(`A`, `B`),
    INDEX `_ProductOptions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OrderItemSelectedOptions` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OrderItemSelectedOptions_AB_unique`(`A`, `B`),
    INDEX `_OrderItemSelectedOptions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ProductOptions` ADD CONSTRAINT `_ProductOptions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductOptions` ADD CONSTRAINT `_ProductOptions_B_fkey` FOREIGN KEY (`B`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrderItemSelectedOptions` ADD CONSTRAINT `_OrderItemSelectedOptions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrderItemSelectedOptions` ADD CONSTRAINT `_OrderItemSelectedOptions_B_fkey` FOREIGN KEY (`B`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
