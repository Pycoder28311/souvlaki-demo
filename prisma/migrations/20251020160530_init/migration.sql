/*
  Warnings:

  - Added the required column `nam` to the `FavoriteIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FavoriteIngredient` ADD COLUMN `nam` INTEGER NOT NULL;
