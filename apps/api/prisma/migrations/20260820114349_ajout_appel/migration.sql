-- CreateEnum
CREATE TYPE "initiateur_appel" AS ENUM ('client', 'professionnel');

-- CreateEnum
CREATE TYPE "statut_appel" AS ENUM ('initie', 'connecte', 'echoue');

-- CreateTable
CREATE TABLE "appel" (
    "id" TEXT NOT NULL,
    "id_demande" TEXT NOT NULL,
    "initie_par" "initiateur_appel" NOT NULL,
    "statut" "statut_appel" NOT NULL DEFAULT 'initie',
    "provider_appel_id" TEXT,
    "duree_secondes" INTEGER,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appel_id_demande_idx" ON "appel"("id_demande");

-- AddForeignKey
ALTER TABLE "appel" ADD CONSTRAINT "appel_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
