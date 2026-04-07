/*
  Warnings:

  - You are about to drop the column `deliveryDate` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryReceipt` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `projectType` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the `RequestItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RequestItem" DROP CONSTRAINT "RequestItem_request_id_fkey";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "deliveryDate",
DROP COLUMN "deliveryReceipt",
DROP COLUMN "projectType",
ADD COLUMN     "orNumber" TEXT,
ADD COLUMN     "storeCategory" TEXT;

-- DropTable
DROP TABLE "RequestItem";

-- CreateTable
CREATE TABLE "RequestProduct" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productName" TEXT NOT NULL,
    "numOfOrderedStock" INTEGER NOT NULL,
    "request_id" UUID NOT NULL,

    CONSTRAINT "RequestProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryReceipt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deliveryReceipt" TEXT,
    "deliveryDate" TIMESTAMP(6),
    "request_id" UUID NOT NULL,

    CONSTRAINT "DeliveryReceipt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestProduct" ADD CONSTRAINT "RequestProduct_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryReceipt" ADD CONSTRAINT "DeliveryReceipt_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
