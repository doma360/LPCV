import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import * as avisService from "@/modules/avis/avis.service.js";
import * as abonnementsService from "@/modules/abonnements/abonnements.service.js";
import type { AccorderAbonnementInput } from "@/modules/abonnements/abonnements.schema.js";
import type {
  ChangerStatutUtilisateurInput,
  ListUtilisateursInput,
  ModerationAvisInput,
  VerificationDecisionInput,
} from "./admin.schema.js";

export async function getStats() {
  const [totalClients, totalProfessionnels, enAttenteVerification, demandesActives, avisSignales, activiteRecente] =
    await Promise.all([
      prisma.client.count(),
      prisma.professionnel.count(),
      prisma.professionnel.count({ where: { statutVerification: "EN_ATTENTE" } }),
      prisma.demande.count({ where: { statut: { in: ["EN_ATTENTE", "ACCEPTEE", "EN_ROUTE", "EN_COURS"] } } }),
      prisma.avis.count({ where: { statut: "SIGNALE" } }),
      prisma.demande.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, statut: true, createdAt: true, profession: { select: { nom: true } } },
      }),
    ]);

  return { totalClients, totalProfessionnels, enAttenteVerification, demandesActives, avisSignales, activiteRecente };
}

export async function listPendingProfessionnels(skip: number, limit: number) {
  const where = { statutVerification: "EN_ATTENTE" as const };
  const [professionnels, total] = await Promise.all([
    prisma.professionnel.findMany({
      where,
      include: { profession: true },
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
    }),
    prisma.professionnel.count({ where }),
  ]);
  return { professionnels: professionnels.map(({ motDePasseHash: _h, ...rest }) => rest), total };
}

export async function decideVerification(professionnelId: string, adminId: string, input: VerificationDecisionInput) {
  const professionnel = await prisma.professionnel.findUnique({ where: { id: professionnelId } });
  if (!professionnel) throw Errors.notFound("Professionnel introuvable");
  if (professionnel.statutVerification !== "EN_ATTENTE") {
    throw Errors.badRequest("Ce professionnel a déjà été traité");
  }

  const [misAJour] = await prisma.$transaction([
    prisma.professionnel.update({ where: { id: professionnelId }, data: { statutVerification: input.decision } }),
    prisma.journalAction.create({
      data: {
        administrateurId: adminId,
        action: input.decision === "VERIFIE" ? "verification_approuvee" : "verification_refusee",
        cibleType: "professionnel",
        cibleId: professionnelId,
      },
    }),
  ]);

  const { motDePasseHash: _h, ...rest } = misAJour;
  return rest;
}

export async function listAvisSignales(skip: number, limit: number) {
  return avisService.listAvisSignales(skip, limit);
}

export async function modererAvisSignale(avisId: string, adminId: string, input: ModerationAvisInput) {
  const avis = await avisService.modererAvis(avisId, adminId, input.decision);
  await prisma.journalAction.create({
    data: {
      administrateurId: adminId,
      action: input.decision === "APPROUVE" ? "avis_approuve" : "avis_masque",
      cibleType: "avis",
      cibleId: avisId,
    },
  });
  return avis;
}

const SELECT_UTILISATEUR = {
  id: true,
  nom: true,
  prenom: true,
  email: true,
  telephone: true,
  photoUrl: true,
  statut: true,
  createdAt: true,
  derniereConnexionAt: true,
} as const;

export async function listUtilisateurs(input: ListUtilisateursInput, skip: number) {
  const recherche = input.q
    ? {
        OR: [
          { nom: { contains: input.q, mode: "insensitive" as const } },
          { prenom: { contains: input.q, mode: "insensitive" as const } },
          { email: { contains: input.q, mode: "insensitive" as const } },
          { telephone: { contains: input.q, mode: "insensitive" as const } },
        ],
      }
    : {};

  if (input.type === "client") {
    const [utilisateurs, total] = await Promise.all([
      prisma.client.findMany({
        where: recherche,
        select: SELECT_UTILISATEUR,
        orderBy: { createdAt: "desc" },
        skip,
        take: input.limit,
      }),
      prisma.client.count({ where: recherche }),
    ]);
    return { utilisateurs, total };
  }

  const [utilisateurs, total] = await Promise.all([
    prisma.professionnel.findMany({
      where: recherche,
      select: { ...SELECT_UTILISATEUR, profession: { select: { nom: true } }, statutVerification: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: input.limit,
    }),
    prisma.professionnel.count({ where: recherche }),
  ]);
  return { utilisateurs, total };
}

export async function changerStatutUtilisateur(
  type: "client" | "professionnel",
  id: string,
  adminId: string,
  input: ChangerStatutUtilisateurInput,
) {
  const utilisateur =
    type === "client" ? await prisma.client.findUnique({ where: { id } }) : await prisma.professionnel.findUnique({ where: { id } });
  if (!utilisateur) throw Errors.notFound("Utilisateur introuvable");

  const [misAJour] = await prisma.$transaction([
    type === "client"
      ? prisma.client.update({ where: { id }, data: { statut: input.statut } })
      : prisma.professionnel.update({ where: { id }, data: { statut: input.statut } }),
    prisma.journalAction.create({
      data: {
        administrateurId: adminId,
        action: input.statut === "SUSPENDU" ? "utilisateur_suspendu" : "utilisateur_reactive",
        cibleType: type,
        cibleId: id,
      },
    }),
  ]);

  const { motDePasseHash: _h, ...rest } = misAJour;
  return rest;
}

// Pas de flux d'achat en libre-service pour l'instant (voir docs/decisions.md,
// chantier reservation/portefeuille) : un administrateur accorde l'abonnement
// manuellement en attendant l'intégration d'un vrai moyen de paiement.
export function accorderAbonnement(professionnelId: string, adminId: string, input: AccorderAbonnementInput) {
  return abonnementsService.accorderAbonnement(professionnelId, adminId, input);
}
