-- CreateTable
CREATE TABLE "Place" (
    "id" UUID NOT NULL,
    "googlePlaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "lat" DECIMAL(10,6),
    "lng" DECIMAL(10,6),
    "brandId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_googlePlaceId_key" ON "Place"("googlePlaceId");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
