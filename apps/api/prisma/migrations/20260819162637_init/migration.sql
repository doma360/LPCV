-- CreateEnum
CREATE TYPE "role_administrateur" AS ENUM ('supervision', 'moderation');

-- CreateEnum
CREATE TYPE "statut_compte" AS ENUM ('actif', 'suspendu');

-- CreateEnum
CREATE TYPE "statut_verification_pro" AS ENUM ('en_attente', 'verifie', 'refuse');

-- CreateEnum
CREATE TYPE "statut_demande" AS ENUM ('en_attente', 'acceptee', 'en_route', 'en_cours', 'terminee', 'annulee', 'refusee');

-- CreateEnum
CREATE TYPE "statut_avis" AS ENUM ('visible', 'signale', 'masque');

-- CreateEnum
CREATE TYPE "methode_paiement" AS ENUM ('wave', 'orange_money', 'mtn_money', 'moov_money', 'especes');

-- CreateEnum
CREATE TYPE "statut_paiement" AS ENUM ('en_attente', 'confirme', 'echoue', 'rembourse');

-- CreateEnum
CREATE TYPE "plateforme" AS ENUM ('android', 'ios');

-- CreateEnum
CREATE TYPE "statut_article" AS ENUM ('brouillon', 'publie');

-- CreateEnum
CREATE TYPE "jour_semaine" AS ENUM ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche');

-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "photo_url" TEXT,
    "statut" "statut_compte" NOT NULL DEFAULT 'actif',
    "derniere_connexion_at" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionnel" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "photo_url" TEXT,
    "presentation" TEXT,
    "id_profession" TEXT NOT NULL,
    "tarif_indicatif_min" DECIMAL(10,2),
    "tarif_indicatif_max" DECIMAL(10,2),
    "statut_verification" "statut_verification_pro" NOT NULL DEFAULT 'en_attente',
    "documents_verification_urls" TEXT[],
    "note_moyenne" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "nombre_avis" INTEGER NOT NULL DEFAULT 0,
    "statut" "statut_compte" NOT NULL DEFAULT 'actif',
    "derniere_connexion_at" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professionnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "mot_de_passe_hash" TEXT NOT NULL,
    "role" "role_administrateur" NOT NULL DEFAULT 'moderation',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profession" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icone_slug" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_intervention" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "zone_intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionnel_zone" (
    "id_professionnel" TEXT NOT NULL,
    "id_zone" TEXT NOT NULL,

    CONSTRAINT "professionnel_zone_pkey" PRIMARY KEY ("id_professionnel","id_zone")
);

-- CreateTable
CREATE TABLE "disponibilite" (
    "id" TEXT NOT NULL,
    "id_professionnel" TEXT NOT NULL,
    "jour" "jour_semaine" NOT NULL,
    "heure_debut" TEXT NOT NULL,
    "heure_fin" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "disponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande" (
    "id" TEXT NOT NULL,
    "id_client" TEXT NOT NULL,
    "id_professionnel" TEXT,
    "id_profession" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos_urls" TEXT[],
    "adresse" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "statut" "statut_demande" NOT NULL DEFAULT 'en_attente',
    "motif_annulation" TEXT,
    "prix_estime" DECIMAL(10,2),
    "date_acceptation" TIMESTAMP(3),
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" TEXT NOT NULL,
    "id_demande" TEXT NOT NULL,
    "id_client" TEXT NOT NULL,
    "id_professionnel" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "statut" "statut_avis" NOT NULL DEFAULT 'visible',
    "id_administrateur_moderateur" TEXT,
    "date_moderation" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiement" (
    "id" TEXT NOT NULL,
    "id_demande" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "montant_net" DECIMAL(10,2) NOT NULL,
    "methode" "methode_paiement" NOT NULL,
    "statut" "statut_paiement" NOT NULL DEFAULT 'en_attente',
    "reference_externe" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_confirmation" TIMESTAMP(3),

    CONSTRAINT "paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "id_demande" TEXT NOT NULL,
    "id_client" TEXT,
    "id_professionnel" TEXT,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appareil" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "plateforme" "plateforme" NOT NULL,
    "id_client" TEXT,
    "id_professionnel" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniere_utilisation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appareil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_blog" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "extrait" TEXT,
    "contenu" TEXT NOT NULL,
    "image_url" TEXT,
    "id_administrateur" TEXT NOT NULL,
    "statut" "statut_article" NOT NULL DEFAULT 'brouillon',
    "date_publication" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametre_plateforme" (
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "date_maj" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametre_plateforme_pkey" PRIMARY KEY ("cle")
);

-- CreateTable
CREATE TABLE "journal_action" (
    "id" TEXT NOT NULL,
    "id_administrateur" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cible_type" TEXT NOT NULL,
    "cible_id" TEXT NOT NULL,
    "details" JSONB,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_telephone_key" ON "client"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "professionnel_email_key" ON "professionnel"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professionnel_telephone_key" ON "professionnel"("telephone");

-- CreateIndex
CREATE INDEX "professionnel_id_profession_idx" ON "professionnel"("id_profession");

-- CreateIndex
CREATE INDEX "professionnel_statut_verification_idx" ON "professionnel"("statut_verification");

-- CreateIndex
CREATE UNIQUE INDEX "administrateur_email_key" ON "administrateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "administrateur_telephone_key" ON "administrateur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "profession_nom_key" ON "profession"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "profession_slug_key" ON "profession"("slug");

-- CreateIndex
CREATE INDEX "zone_intervention_commune_idx" ON "zone_intervention"("commune");

-- CreateIndex
CREATE INDEX "disponibilite_id_professionnel_idx" ON "disponibilite"("id_professionnel");

-- CreateIndex
CREATE INDEX "demande_id_client_idx" ON "demande"("id_client");

-- CreateIndex
CREATE INDEX "demande_id_professionnel_idx" ON "demande"("id_professionnel");

-- CreateIndex
CREATE INDEX "demande_statut_idx" ON "demande"("statut");

-- CreateIndex
CREATE INDEX "demande_date_creation_idx" ON "demande"("date_creation");

-- CreateIndex
CREATE UNIQUE INDEX "avis_id_demande_key" ON "avis"("id_demande");

-- CreateIndex
CREATE INDEX "avis_id_professionnel_idx" ON "avis"("id_professionnel");

-- CreateIndex
CREATE INDEX "avis_statut_idx" ON "avis"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "paiement_id_demande_key" ON "paiement"("id_demande");

-- CreateIndex
CREATE INDEX "paiement_statut_idx" ON "paiement"("statut");

-- CreateIndex
CREATE INDEX "message_id_demande_idx" ON "message"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "appareil_token_key" ON "appareil"("token");

-- CreateIndex
CREATE UNIQUE INDEX "article_blog_slug_key" ON "article_blog"("slug");

-- CreateIndex
CREATE INDEX "article_blog_statut_idx" ON "article_blog"("statut");

-- CreateIndex
CREATE INDEX "journal_action_id_administrateur_idx" ON "journal_action"("id_administrateur");

-- CreateIndex
CREATE INDEX "journal_action_cible_type_cible_id_idx" ON "journal_action"("cible_type", "cible_id");

-- AddForeignKey
ALTER TABLE "professionnel" ADD CONSTRAINT "professionnel_id_profession_fkey" FOREIGN KEY ("id_profession") REFERENCES "profession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnel_zone" ADD CONSTRAINT "professionnel_zone_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnel_zone" ADD CONSTRAINT "professionnel_zone_id_zone_fkey" FOREIGN KEY ("id_zone") REFERENCES "zone_intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilite" ADD CONSTRAINT "disponibilite_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_profession_fkey" FOREIGN KEY ("id_profession") REFERENCES "profession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_administrateur_moderateur_fkey" FOREIGN KEY ("id_administrateur_moderateur") REFERENCES "administrateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appareil" ADD CONSTRAINT "appareil_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appareil" ADD CONSTRAINT "appareil_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_blog" ADD CONSTRAINT "article_blog_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "administrateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_action" ADD CONSTRAINT "journal_action_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "administrateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
