-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_chocolateId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "chocolateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_chocolateId_fkey" FOREIGN KEY ("chocolateId") REFERENCES "Chocolate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
