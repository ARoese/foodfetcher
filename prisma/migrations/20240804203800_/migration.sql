/*
  Warnings:

  - Added the required column `sortIndex` to the `IngredientEntry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IngredientEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredientName" TEXT NOT NULL,
    "measureSymbol" TEXT,
    "amount" REAL NOT NULL,
    "amount2" REAL,
    "sortIndex" INTEGER NOT NULL,
    CONSTRAINT "IngredientEntry_ingredientName_fkey" FOREIGN KEY ("ingredientName") REFERENCES "Ingredient" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_IngredientEntry" ("amount", "amount2", "id", "ingredientName", "measureSymbol") SELECT "amount", "amount2", "id", "ingredientName", "measureSymbol" FROM "IngredientEntry";
DROP TABLE "IngredientEntry";
ALTER TABLE "new_IngredientEntry" RENAME TO "IngredientEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
