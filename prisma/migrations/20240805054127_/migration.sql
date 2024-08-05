-- CreateTable
CREATE TABLE "Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "owningUserId" INTEGER NOT NULL,
    CONSTRAINT "Plan_owningUserId_fkey" FOREIGN KEY ("owningUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayName" TEXT NOT NULL,
    "planId" INTEGER NOT NULL,
    CONSTRAINT "PlanDay_dayName_fkey" FOREIGN KEY ("dayName") REFERENCES "Weekday" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Weekday" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "_favoritedBy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_favoritedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_favoritedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PlanDayToRecipe" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PlanDayToRecipe_A_fkey" FOREIGN KEY ("A") REFERENCES "PlanDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlanDayToRecipe_B_fkey" FOREIGN KEY ("B") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_owningUserId_key" ON "Plan"("name", "owningUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanDay_planId_dayName_key" ON "PlanDay"("planId", "dayName");

-- CreateIndex
CREATE UNIQUE INDEX "Weekday_name_key" ON "Weekday"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_favoritedBy_AB_unique" ON "_favoritedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_favoritedBy_B_index" ON "_favoritedBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PlanDayToRecipe_AB_unique" ON "_PlanDayToRecipe"("A", "B");

-- CreateIndex
CREATE INDEX "_PlanDayToRecipe_B_index" ON "_PlanDayToRecipe"("B");
