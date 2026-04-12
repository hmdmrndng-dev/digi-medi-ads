/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `InvoiceReceipt` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[receiptNo]` on the table `CollectionReceipt` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiptNo]` on the table `DeliveryReceipt` will be added. If there are existing duplicate values, this will fail.
  - Made the column `receiptNo` on table `CollectionReceipt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `receiptNo` on table `DeliveryReceipt` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedBy` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InvoiceReceipt" DROP CONSTRAINT "InvoiceReceipt_request_id_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAllocation" DROP CONSTRAINT "PaymentAllocation_invoiceId_fkey";

-- AlterTable
ALTER TABLE "CollectionReceipt" ALTER COLUMN "receiptNo" SET NOT NULL;

-- AlterTable
ALTER TABLE "DeliveryReceipt" ALTER COLUMN "receiptNo" SET NOT NULL;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "updatedBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY['user']::TEXT[];

-- DropTable
DROP TABLE "InvoiceReceipt";

-- CreateTable
CREATE TABLE "ServiceInvoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoiceNo" TEXT NOT NULL,
    "amountDue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "request_id" UUID NOT NULL,

    CONSTRAINT "ServiceInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceInvoice_invoiceNo_key" ON "ServiceInvoice"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionReceipt_receiptNo_key" ON "CollectionReceipt"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryReceipt_receiptNo_key" ON "DeliveryReceipt"("receiptNo");

-- AddForeignKey
ALTER TABLE "ServiceInvoice" ADD CONSTRAINT "ServiceInvoice_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ServiceInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
