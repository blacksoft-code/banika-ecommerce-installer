-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shippingMethodName" TEXT;
