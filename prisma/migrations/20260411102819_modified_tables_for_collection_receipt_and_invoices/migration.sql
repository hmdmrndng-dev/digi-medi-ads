/*
  Warnings:

  - You are about to drop the column `request_id` on the `CollectionReceipt` table. All the data in the column will be lost.
  - You are about to drop the `ServiceInvoices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CollectionReceipt" DROP CONSTRAINT "CollectionReceipt_request_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceInvoices" DROP CONSTRAINT "ServiceInvoices_request_id_fkey";

-- AlterTable
ALTER TABLE "CollectionReceipt" DROP COLUMN "request_id";

-- DropTable
DROP TABLE "ServiceInvoices";

-- CreateTable
CREATE TABLE "InvoiceReceipt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoiceNo" TEXT NOT NULL,
    "amountDue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "request_id" UUID NOT NULL,

    CONSTRAINT "InvoiceReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "collectionId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "amountApplied" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_collectionId_invoiceId_key" ON "PaymentAllocation"("collectionId", "invoiceId");

-- AddForeignKey
ALTER TABLE "InvoiceReceipt" ADD CONSTRAINT "InvoiceReceipt_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "CollectionReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "InvoiceReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
