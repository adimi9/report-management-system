/*
  Warnings:

  - You are about to drop the column `rejection_reason` on the `report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "report" DROP COLUMN "rejection_reason",
ADD COLUMN     "response" TEXT;
