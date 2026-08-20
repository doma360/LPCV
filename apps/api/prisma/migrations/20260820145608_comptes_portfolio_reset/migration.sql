-- AlterTable
ALTER TABLE "client" ADD COLUMN     "notifications_actives" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reset_token_expire_at" TIMESTAMP(3),
ADD COLUMN     "reset_token_hash" TEXT;

-- AlterTable
ALTER TABLE "professionnel" ADD COLUMN     "notifications_actives" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "portfolio_urls" TEXT[],
ADD COLUMN     "reset_token_expire_at" TIMESTAMP(3),
ADD COLUMN     "reset_token_hash" TEXT;
