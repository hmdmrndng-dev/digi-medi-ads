/*
  Warnings:

  - You are about to drop the column `request_id` on the `DeliveryReceipt` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseOrderNo` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `request_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `request_id` on the `ServiceInvoice` table. All the data in the column will be lost.
  - Added the required column `purchaseOrder_id` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DeliveryReceipt" DROP CONSTRAINT "DeliveryReceipt_request_id_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_request_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceInvoice" DROP CONSTRAINT "ServiceInvoice_request_id_fkey";

-- AlterTable
ALTER TABLE "DeliveryReceipt" DROP COLUMN "request_id";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "purchaseOrderNo",
DROP COLUMN "request_id",
ADD COLUMN     "purchaseOrder_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ServiceInvoice" DROP COLUMN "request_id";

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "poNumber" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "request_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quantityDelivered" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "deliveryReceipt_id" UUID NOT NULL,

    CONSTRAINT "DeliveryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quantityBilled" INTEGER NOT NULL,
    "amountBilled" DECIMAL(10,2),
    "product_id" UUID NOT NULL,
    "serviceInvoice_id" UUID NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_purchaseOrder_id_fkey" FOREIGN KEY ("purchaseOrder_id") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryItem" ADD CONSTRAINT "DeliveryItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryItem" ADD CONSTRAINT "DeliveryItem_deliveryReceipt_id_fkey" FOREIGN KEY ("deliveryReceipt_id") REFERENCES "DeliveryReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_serviceInvoice_id_fkey" FOREIGN KEY ("serviceInvoice_id") REFERENCES "ServiceInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
