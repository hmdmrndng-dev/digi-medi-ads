/*
  Warnings:

  - You are about to drop the column `deliverBy` on the `Request` table. All the data in the column will be lost.
  - Made the column `status` on table `Request` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "deliverBy",
ADD COLUMN     "courier" TEXT,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';
