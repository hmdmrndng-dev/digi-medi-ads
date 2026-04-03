-- CreateTable
CREATE TABLE "Expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT,
    "tags" TEXT[],
    "amount" DECIMAL(10,2),
    "modeOfPayment" TEXT,
    "notes" TEXT,
    "taxClassification" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productName" TEXT NOT NULL,
    "numOfOrderedStock" INTEGER NOT NULL,
    "status" TEXT,
    "deliverBy" TEXT,
    "receivedBy" TEXT,
    "location" TEXT,
    "deliveredAt" TIMESTAMP(6),
    "purchaseOrderId" TEXT,
    "amountDue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceInvoicePayment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "serviceInvoiceId" TEXT NOT NULL,
    "amountPaid" DECIMAL(10,2),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "ServiceInvoicePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ServiceInvoicePayment" ADD CONSTRAINT "ServiceInvoicePayment_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
