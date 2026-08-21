-- CreateEnum
CREATE TYPE "palier_abonnement" AS ENUM ('mensuel', 'annuel');

-- CreateEnum
CREATE TYPE "statut_abonnement" AS ENUM ('actif', 'expire', 'annule');

-- CreateTable
CREATE TABLE "abonnement" (
    "id" TEXT NOT NULL,
    "id_professionnel" TEXT NOT NULL,
    "palier" "palier_abonnement" NOT NULL,
    "statut" "statut_abonnement" NOT NULL DEFAULT 'actif',
    "montant" DECIMAL(10,2) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "abonnement_id_professionnel_key" ON "abonnement"("id_professionnel");

-- AddForeignKey
ALTER TABLE "abonnement" ADD CONSTRAINT "abonnement_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
