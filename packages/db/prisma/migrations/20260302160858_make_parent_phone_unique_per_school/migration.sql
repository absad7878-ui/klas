/*
  Warnings:

  - A unique constraint covering the columns `[phone,schoolId]` on the table `parents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "parents_phone_schoolId_key" ON "parents"("phone", "schoolId");
