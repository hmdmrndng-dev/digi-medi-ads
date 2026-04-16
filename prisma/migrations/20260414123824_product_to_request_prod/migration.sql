/*
  Warnings:

  - You are about to drop the `RequestProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RequestProduct" DROP CONSTRAINT "RequestProduct_request_id_fkey";

-- DropTable
DROP TABLE "RequestProduct";

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "purchaseOrderNo" TEXT,
    "productName" TEXT NOT NULL,
    "numOfOrderedStock" INTEGER NOT NULL,
    "amount" DECIMAL(10,2),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "request_id" UUID NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
