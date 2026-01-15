/*
  Warnings:

  - You are about to alter the column `lat` on the `Place` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `DoublePrecision`.
  - You are about to alter the column `lng` on the `Place` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Place" ALTER COLUMN "lat" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lng" SET DATA TYPE DOUBLE PRECISION;
