/*
  Warnings:

  - You are about to drop the column `courier` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredAt` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `numOfOrderedStock` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `receivedBy` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `request_id` on the `ServiceInvoicePayment` table. All the data in the column will be lost.
  - Added the required column `projectType` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceInvoiceId` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `serviceInvoiceId` on the `ServiceInvoicePayment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ServiceInvoicePayment" DROP CONSTRAINT "ServiceInvoicePayment_request_id_fkey";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "courier",
DROP COLUMN "deliveredAt",
DROP COLUMN "location",
DROP COLUMN "numOfOrderedStock",
DROP COLUMN "productName",
DROP COLUMN "receivedBy",
DROP COLUMN "status",
ADD COLUMN     "deliveryDate" TIMESTAMP(6),
ADD COLUMN     "deliveryReceipt" TEXT,
ADD COLUMN     "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "projectType" TEXT NOT NULL,
ADD COLUMN     "requestor" TEXT,
ADD COLUMN     "serviceInvoiceId" TEXT NOT NULL,
ADD COLUMN     "storeName" TEXT;

-- AlterTable
ALTER TABLE "ServiceInvoicePayment" DROP COLUMN "request_id",
DROP COLUMN "serviceInvoiceId",
ADD COLUMN     "serviceInvoiceId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "RequestItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productName" TEXT NOT NULL,
    "numOfOrderedStock" INTEGER NOT NULL,
    "request_id" UUID NOT NULL,

    CONSTRAINT "RequestItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceInvoicePayment" ADD CONSTRAINT "ServiceInvoicePayment_serviceInvoiceId_fkey" FOREIGN KEY ("serviceInvoiceId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
