-- DropForeignKey
ALTER TABLE `FavoriteIngredient` DROP FOREIGN KEY `FavoriteIngredient_ingredientId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItemIngredient` DROP FOREIGN KEY `OrderItemIngredient_ingredientId_fkey`;

-- DropIndex
DROP INDEX `FavoriteIngredient_ingredientId_fkey` ON `FavoriteIngredient`;

-- DropIndex
DROP INDEX `OrderItemIngredient_ingredientId_fkey` ON `OrderItemIngredient`;

-- AddForeignKey
ALTER TABLE `OrderItemIngredient` ADD CONSTRAINT `OrderItemIngredient_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteIngredient` ADD CONSTRAINT `FavoriteIngredient_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
