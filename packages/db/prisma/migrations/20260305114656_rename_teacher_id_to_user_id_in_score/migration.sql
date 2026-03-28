/*
  Warnings:

  - You are about to drop the column `date` on the `scores` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `scores` table. All the data in the column will be lost.
  - Added the required column `userId` to the `scores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "scores" DROP CONSTRAINT "scores_teacherId_fkey";

-- DropIndex
DROP INDEX "scores_teacherId_idx";

-- AlterTable
ALTER TABLE "scores" DROP COLUMN "date",
DROP COLUMN "teacherId",
ADD COLUMN     "dateEntered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "scores_userId_idx" ON "scores"("userId");

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
