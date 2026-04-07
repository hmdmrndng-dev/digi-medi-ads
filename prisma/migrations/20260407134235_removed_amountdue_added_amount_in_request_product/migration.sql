/*
  Warnings:

  - You are about to drop the column `amountDue` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "amountDue";

-- AlterTable
ALTER TABLE "RequestProduct" ADD COLUMN     "amount" DECIMAL(10,2);
