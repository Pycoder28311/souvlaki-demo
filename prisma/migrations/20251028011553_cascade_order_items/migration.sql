-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_orderItemId_fkey`;

-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_productId_fkey`;

-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_userId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriteIngredient` DROP FOREIGN KEY `FavoriteIngredient_favoriteId_fkey`;

-- DropForeignKey
ALTER TABLE `IngCategory` DROP FOREIGN KEY `IngCategory_productId_fkey`;

-- DropForeignKey
ALTER TABLE `Ingredient` DROP FOREIGN KEY `Ingredient_ingCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `Options` DROP FOREIGN KEY `Options_productId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItemIngredient` DROP FOREIGN KEY `OrderItemIngredient_orderItemId_fkey`;

-- DropForeignKey
ALTER TABLE `PasswordReset` DROP FOREIGN KEY `PasswordReset_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_imageId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductOrder` DROP FOREIGN KEY `ProductOrder_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_reviewedId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_reviewerId_fkey`;

-- DropIndex
DROP INDEX `Favorite_orderItemId_fkey` ON `Favorite`;

-- DropIndex
DROP INDEX `Favorite_productId_fkey` ON `Favorite`;

-- DropIndex
DROP INDEX `Favorite_userId_fkey` ON `Favorite`;

-- DropIndex
DROP INDEX `FavoriteIngredient_favoriteId_fkey` ON `FavoriteIngredient`;

-- DropIndex
DROP INDEX `IngCategory_productId_fkey` ON `IngCategory`;

-- DropIndex
DROP INDEX `Ingredient_ingCategoryId_fkey` ON `Ingredient`;

-- DropIndex
DROP INDEX `Message_receiverId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_senderId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Options_productId_fkey` ON `Options`;

-- DropIndex
DROP INDEX `OrderItem_productId_fkey` ON `OrderItem`;

-- DropIndex
DROP INDEX `OrderItemIngredient_orderItemId_fkey` ON `OrderItemIngredient`;

-- DropIndex
DROP INDEX `PasswordReset_userId_fkey` ON `PasswordReset`;

-- DropIndex
DROP INDEX `Product_categoryId_fkey` ON `Product`;

-- DropIndex
DROP INDEX `ProductOrder_userId_fkey` ON `ProductOrder`;

-- DropIndex
DROP INDEX `Review_reviewedId_fkey` ON `Review`;

-- DropIndex
DROP INDEX `Review_reviewerId_fkey` ON `Review`;

-- AddForeignKey
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_reviewedId_fkey` FOREIGN KEY (`reviewedId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Options` ADD CONSTRAINT `Options_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngCategory` ADD CONSTRAINT `IngCategory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ingredient` ADD CONSTRAINT `Ingredient_ingCategoryId_fkey` FOREIGN KEY (`ingCategoryId`) REFERENCES `IngCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOrder` ADD CONSTRAINT `ProductOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemIngredient` ADD CONSTRAINT `OrderItemIngredient_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteIngredient` ADD CONSTRAINT `FavoriteIngredient_favoriteId_fkey` FOREIGN KEY (`favoriteId`) REFERENCES `Favorite`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
