-- CreateTable
CREATE TABLE `Options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `answer` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `comment` VARCHAR(191) NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OptionsToOrderItem` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OptionsToOrderItem_AB_unique`(`A`, `B`),
    INDEX `_OptionsToOrderItem_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Options` ADD CONSTRAINT `Options_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OptionsToOrderItem` ADD CONSTRAINT `_OptionsToOrderItem_A_fkey` FOREIGN KEY (`A`) REFERENCES `Options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OptionsToOrderItem` ADD CONSTRAINT `_OptionsToOrderItem_B_fkey` FOREIGN KEY (`B`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
