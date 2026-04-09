/*
  Warnings:

  - You are about to drop the column `deliveryDate` on the `DeliveryReceipt` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryReceipt` on the `DeliveryReceipt` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseOrderId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the `ServiceInvoicePayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceInvoicePayment" DROP CONSTRAINT "ServiceInvoicePayment_request_id_fkey";

-- AlterTable
ALTER TABLE "DeliveryReceipt" DROP COLUMN "deliveryDate",
DROP COLUMN "deliveryReceipt",
ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateDelivered" TIMESTAMP(6),
ADD COLUMN     "receiptNo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "request_id" UUID;

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "purchaseOrderId",
ADD COLUMN     "tinNo" TEXT;

-- AlterTable
ALTER TABLE "RequestProduct" ADD COLUMN     "purchaseOrderNo" TEXT;

-- DropTable
DROP TABLE "ServiceInvoicePayment";

-- CreateTable
CREATE TABLE "CollectionReceipt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "receiptNo" TEXT,
    "amountPaid" DECIMAL(10,2),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "request_id" UUID NOT NULL,

    CONSTRAINT "CollectionReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceInvoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoiceNo" TEXT NOT NULL,
    "amountDue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "request_id" UUID NOT NULL,

    CONSTRAINT "ServiceInvoices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionReceipt" ADD CONSTRAINT "CollectionReceipt_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceInvoices" ADD CONSTRAINT "ServiceInvoices_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
