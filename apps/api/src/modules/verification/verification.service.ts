import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";

// Endpoint public consulte via le QR code de la carte membre (voir docs/decisions.md).
// Le type/delai d'abonnement ne sont revele que si l'abonnement est reellement
// actif et non expire, meme si un job d'expiration passive n'est pas encore
// passe dessus ailleurs dans l'app.
export async function getCarteVerification(professionnelId: string) {
  const professionnel = await prisma.professionnel.findUnique({
    where: { id: professionnelId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      photoUrl: true,
      statutVerification: true,
      createdAt: true,
      profession: { select: { nom: true } },
      abonnement: { select: { statut: true, palier: true, dateFin: true } },
    },
  });
  if (!professionnel) throw Errors.notFound("Professionnel introuvable");

  const abonnementActif =
    professionnel.abonnement?.statut === "ACTIF" && professionnel.abonnement.dateFin > new Date();

  return {
    professionnelId: professionnel.id,
    nomComplet: `${professionnel.prenom} ${professionnel.nom}`,
    metier: professionnel.profession.nom,
    photoUrl: professionnel.photoUrl,
    verifie: professionnel.statutVerification === "VERIFIE",
    membreDepuis: professionnel.createdAt,
    abonnementActif,
    palier: abonnementActif ? professionnel.abonnement!.palier : null,
    dateFin: abonnementActif ? professionnel.abonnement!.dateFin : null,
  };
}
