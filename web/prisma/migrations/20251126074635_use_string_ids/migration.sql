/*
  Warnings:

  - The primary key for the `Brand` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Chocolate` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Chocolate" DROP CONSTRAINT "Chocolate_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Chocolate" DROP CONSTRAINT "Chocolate_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_chocolateId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Brand_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Brand_id_seq";

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Category_id_seq";

-- AlterTable
ALTER TABLE "Chocolate" DROP CONSTRAINT "Chocolate_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "brandId" SET DATA TYPE TEXT,
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Chocolate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Chocolate_id_seq";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "chocolateId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_chocolateId_fkey" FOREIGN KEY ("chocolateId") REFERENCES "Chocolate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chocolate" ADD CONSTRAINT "Chocolate_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chocolate" ADD CONSTRAINT "Chocolate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
