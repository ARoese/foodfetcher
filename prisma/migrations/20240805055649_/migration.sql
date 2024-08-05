-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "owningUserId" INTEGER NOT NULL,
    CONSTRAINT "Plan_owningUserId_fkey" FOREIGN KEY ("owningUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Plan" ("id", "name", "owningUserId") SELECT "id", "name", "owningUserId" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_name_owningUserId_key" ON "Plan"("name", "owningUserId");
CREATE TABLE "new_PlanDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayName" TEXT NOT NULL,
    "planId" INTEGER NOT NULL,
    CONSTRAINT "PlanDay_dayName_fkey" FOREIGN KEY ("dayName") REFERENCES "Weekday" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlanDay" ("dayName", "id", "planId") SELECT "dayName", "id", "planId" FROM "PlanDay";
DROP TABLE "PlanDay";
ALTER TABLE "new_PlanDay" RENAME TO "PlanDay";
CREATE UNIQUE INDEX "PlanDay_planId_dayName_key" ON "PlanDay"("planId", "dayName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
