/*
  Warnings:

  - A unique constraint covering the columns `[studentId,term]` on the table `fee_status` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "fee_status_studentId_term_key" ON "fee_status"("studentId", "term");
