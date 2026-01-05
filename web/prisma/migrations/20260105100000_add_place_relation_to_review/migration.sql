-- Add optional placeId column to Review and create FK to Place
ALTER TABLE "Review" ADD COLUMN "placeId" UUID;

-- Add foreign key constraint (SET NULL on delete)
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_placeId_fkey"
  FOREIGN KEY ("placeId") REFERENCES "Place"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

