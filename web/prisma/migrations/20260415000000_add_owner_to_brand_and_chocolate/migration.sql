-- Add owner references to Brand and Chocolate
ALTER TABLE "Brand" ADD COLUMN "userId" TEXT;
ALTER TABLE "Chocolate" ADD COLUMN "userId" TEXT;

ALTER TABLE "Brand"
  ADD CONSTRAINT "Brand_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "Chocolate"
  ADD CONSTRAINT "Chocolate_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
