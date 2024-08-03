/*
  Warnings:

  - You are about to drop the `IngredientStyle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quantifier` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Ingredient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `ingredientId` on the `IngredientEntry` table. All the data in the column will be lost.
  - You are about to drop the column `quantifierId` on the `IngredientEntry` table. All the data in the column will be lost.
  - You are about to drop the column `quantifierSpecial` on the `IngredientEntry` table. All the data in the column will be lost.
  - You are about to drop the column `styleId` on the `IngredientEntry` table. All the data in the column will be lost.
  - Added the required column `ingredientName` to the `IngredientEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "IngredientStyle";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Quantifier";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "name" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Ingredient" ("name") SELECT "name" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");
CREATE TABLE "new_IngredientEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredientName" TEXT NOT NULL,
    "measureSymbol" TEXT,
    "amount" REAL NOT NULL,
    CONSTRAINT "IngredientEntry_ingredientName_fkey" FOREIGN KEY ("ingredientName") REFERENCES "Ingredient" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_IngredientEntry" ("amount", "id") SELECT "amount", "id" FROM "IngredientEntry";
DROP TABLE "IngredientEntry";
ALTER TABLE "new_IngredientEntry" RENAME TO "IngredientEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
