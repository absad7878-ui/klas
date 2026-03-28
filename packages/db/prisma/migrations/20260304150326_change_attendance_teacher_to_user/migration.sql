/*
  Warnings:

  - You are about to drop the column `teacherId` on the `attendance` table. All the data in the column will be lost.
  - Added the required column `userId` to the `attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_teacherId_fkey";

-- DropIndex
DROP INDEX "attendance_teacherId_idx";

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "teacherId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "attendance_userId_idx" ON "attendance"("userId");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
