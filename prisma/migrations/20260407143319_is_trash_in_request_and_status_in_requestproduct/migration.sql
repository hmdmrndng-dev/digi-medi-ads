-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "inTrash" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RequestProduct" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
