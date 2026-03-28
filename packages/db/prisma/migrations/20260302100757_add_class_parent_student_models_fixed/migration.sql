/*
  Warnings:

  - You are about to drop the column `classId` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_classId_fkey";

-- DropIndex
DROP INDEX "students_classId_idx";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "classId",
ADD COLUMN     "className" TEXT;
