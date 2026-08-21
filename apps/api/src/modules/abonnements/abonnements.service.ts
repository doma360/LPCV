import { prisma } from "@/lib/prisma.js";
import { getParametreNombre } from "@/lib/parametres.js";
import { Errors } from "@/utils/errors.js";
import type { AccorderAbonnementInput } from "./abonnements.schema.js";

// Montants par defaut, modifiables via ParametrePlateforme (futur ecran
// "Parametres" admin) sans toucher au code.
const DUREE_MOIS: Record<AccorderAbonnementInput["palier"], number> = {
  MENSUEL: 1,
  ANNUEL: 12,
};

async function montantPourPalier(palier: AccorderAbonnementInput["palier"]) {
  if (palier === "MENSUEL") return getParametreNombre("abonnement_mensuel_fcfa", 5000);
  return getParametreNombre("abonnement_annuel_fcfa", 40000);
}

export async function getAbonnement(professionnelId: string) {
  const abonnement = await prisma.abonnement.findUnique({ where: { professionnelId } });
  if (!abonnement) return null;

  // Expiration passive : pas de job planifie pour l'instant, on constate
  // l'expiration a la lecture plutot que de la laisser afficher "actif" a tort.
  if (abonnement.statut === "ACTIF" && abonnement.dateFin < new Date()) {
    return prisma.abonnement.update({ where: { professionnelId }, data: { statut: "EXPIRE" } });
  }
  return abonnement;
}

export async function accorderAbonnement(professionnelId: string, adminId: string, input: AccorderAbonnementInput) {
  const professionnel = await prisma.professionnel.findUnique({ where: { id: professionnelId } });
  if (!professionnel) throw Errors.notFound("Professionnel introuvable");

  const montant = await montantPourPalier(input.palier);
  const dateDebut = new Date();
  const dateFin = new Date(dateDebut);
  dateFin.setMonth(dateFin.getMonth() + DUREE_MOIS[input.palier]);

  const [abonnement] = await prisma.$transaction([
    prisma.abonnement.upsert({
      where: { professionnelId },
      create: { professionnelId, palier: input.palier, statut: "ACTIF", montant, dateDebut, dateFin },
      update: { palier: input.palier, statut: "ACTIF", montant, dateDebut, dateFin },
    }),
    prisma.journalAction.create({
      data: {
        administrateurId: adminId,
        action: "abonnement_accorde",
        cibleType: "professionnel",
        cibleId: professionnelId,
        details: { palier: input.palier, montant: montant.toString() },
      },
    }),
  ]);

  return abonnement;
}
