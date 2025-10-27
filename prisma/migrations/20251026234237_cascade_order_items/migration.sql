-- CreateTable
CREATE TABLE `PaymentIntent` (
    `id` VARCHAR(191) NOT NULL,
    `stripeId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PaymentIntent_stripeId_key`(`stripeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
