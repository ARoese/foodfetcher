-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "passhash" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "preferredMeasureSystem" TEXT NOT NULL DEFAULT 'imperial'
);
INSERT INTO "new_User" ("id", "name", "passhash", "preferredMeasureSystem") SELECT "id", "name", "passhash", "preferredMeasureSystem" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
