-- AlterTable
ALTER TABLE "CollectionReceipt" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "DeliveryReceipt" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ServiceInvoice" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
