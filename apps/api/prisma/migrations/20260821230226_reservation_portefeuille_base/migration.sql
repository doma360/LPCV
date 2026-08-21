
-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'PAYEE', 'TERMINEE', 'ANNULEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "TypeMouvementPortefeuille" AS ENUM ('CREDIT_RESERVATION', 'RETRAIT');

-- DropForeignKey
ALTER TABLE "appel" DROP CONSTRAINT "appel_id_demande_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_id_demande_fkey";

-- DropForeignKey
ALTER TABLE "paiement" DROP CONSTRAINT "paiement_id_demande_fkey";

-- DropIndex
DROP INDEX "message_id_demande_idx";

-- AlterTable
ALTER TABLE "appel" ADD COLUMN     "id_reservation" TEXT,
ALTER COLUMN "id_demande" DROP NOT NULL;

-- AlterTable
ALTER TABLE "message" DROP COLUMN "id_demande",
ADD COLUMN     "id_reservation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "paiement" ADD COLUMN     "id_reservation" TEXT,
ALTER COLUMN "id_demande" DROP NOT NULL;

-- AlterTable
ALTER TABLE "professionnel" ADD COLUMN     "a_local" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adresse_local" TEXT;

-- CreateTable
CREATE TABLE "reservation" (
    "id" TEXT NOT NULL,
    "id_client" TEXT NOT NULL,
    "id_professionnel" TEXT NOT NULL,
    "id_profession" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_souhaitee" TIMESTAMP(3),
    "date_confirmee" TIMESTAMP(3),
    "montant" DECIMAL(10,2),
    "statut" "StatutReservation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portefeuille" (
    "id" TEXT NOT NULL,
    "id_professionnel" TEXT NOT NULL,
    "solde" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portefeuille_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvement_portefeuille" (
    "id" TEXT NOT NULL,
    "id_portefeuille" TEXT NOT NULL,
    "type" "TypeMouvementPortefeuille" NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "id_reservation" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvement_portefeuille_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservation_id_client_idx" ON "reservation"("id_client");

-- CreateIndex
CREATE INDEX "reservation_id_professionnel_idx" ON "reservation"("id_professionnel");

-- CreateIndex
CREATE INDEX "reservation_statut_idx" ON "reservation"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "portefeuille_id_professionnel_key" ON "portefeuille"("id_professionnel");

-- CreateIndex
CREATE INDEX "mouvement_portefeuille_id_portefeuille_idx" ON "mouvement_portefeuille"("id_portefeuille");

-- CreateIndex
CREATE INDEX "appel_id_reservation_idx" ON "appel"("id_reservation");

-- CreateIndex
CREATE INDEX "message_id_reservation_idx" ON "message"("id_reservation");

-- CreateIndex
CREATE UNIQUE INDEX "paiement_id_reservation_key" ON "paiement"("id_reservation");

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_profession_fkey" FOREIGN KEY ("id_profession") REFERENCES "profession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portefeuille" ADD CONSTRAINT "portefeuille_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvement_portefeuille" ADD CONSTRAINT "mouvement_portefeuille_id_portefeuille_fkey" FOREIGN KEY ("id_portefeuille") REFERENCES "portefeuille"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appel" ADD CONSTRAINT "appel_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appel" ADD CONSTRAINT "appel_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

