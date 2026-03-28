/*
  Warnings:

  - You are about to drop the column `errorMessage` on the `SmsLog` table. All the data in the column will be lost.
  - You are about to drop the column `apiKey` on the `SmsSettings` table. All the data in the column will be lost.
  - Made the column `senderId` on table `SmsSettings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "SmsLog_createdAt_idx";

-- DropIndex
DROP INDEX "SmsLog_schoolId_idx";

-- DropIndex
DROP INDEX "SmsLog_studentId_idx";

-- AlterTable
ALTER TABLE "SmsLog" DROP COLUMN "errorMessage";

-- AlterTable
ALTER TABLE "SmsSettings" DROP COLUMN "apiKey",
ADD COLUMN     "termiiApiKey" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "senderId" SET NOT NULL,
ALTER COLUMN "senderId" SET DEFAULT 'SchoolApp';

-- CreateIndex
CREATE INDEX "SmsLog_schoolId_createdAt_idx" ON "SmsLog"("schoolId", "createdAt");

-- CreateIndex
CREATE INDEX "SmsLog_schoolId_status_idx" ON "SmsLog"("schoolId", "status");

-- AddForeignKey
ALTER TABLE "SmsLog" ADD CONSTRAINT "SmsLog_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
