/*
  Warnings:

  - You are about to drop the column `productId` on the `Request` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectCode]` on the table `Request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectCode` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "productId",
ADD COLUMN     "projectCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Request_projectCode_key" ON "Request"("projectCode");
