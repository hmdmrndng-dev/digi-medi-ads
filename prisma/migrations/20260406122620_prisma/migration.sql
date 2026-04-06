/*
  Warnings:

  - You are about to drop the column `serviceInvoiceId` on the `Request` table. All the data in the column will be lost.
  - Added the required column `request_id` to the `ServiceInvoicePayment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServiceInvoicePayment" DROP CONSTRAINT "ServiceInvoicePayment_serviceInvoiceId_fkey";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "serviceInvoiceId";

-- AlterTable
ALTER TABLE "ServiceInvoicePayment" ADD COLUMN     "request_id" UUID NOT NULL,
ALTER COLUMN "serviceInvoiceId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "ServiceInvoicePayment" ADD CONSTRAINT "ServiceInvoicePayment_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
