-- AlterTable
ALTER TABLE "demande" ADD COLUMN     "position_maj_at" TIMESTAMP(3),
ADD COLUMN     "professionnel_lat" DECIMAL(9,6),
ADD COLUMN     "professionnel_lng" DECIMAL(9,6);
