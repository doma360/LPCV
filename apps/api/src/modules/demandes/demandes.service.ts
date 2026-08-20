import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import type { Role } from "@/lib/jwt.js";
import { getParametreNombre } from "@/lib/parametres.js";
import { calculerPrixEstime } from "@/lib/tarification.js";
import { getTelephonieProvider } from "@/lib/telephonie/index.js";
import { distanceToProfessionnel } from "@/modules/professionnels/professionnels.service.js";
import type { CreateDemandeInput, ListDemandesInput, UpdatePositionInput, UpdateStatutInput } from "./demandes.schema.js";

const include = {
  client: { select: { id: true, nom: true, prenom: true, telephone: true, photoUrl: true } },
  professionnel: { select: { id: true, nom: true, prenom: true, telephone: true, photoUrl: true } },
  profession: true,
} as const;

export async function createDemande(clientId: string, input: CreateDemandeInput) {
  let prixEstime: number | null = null;

  if (input.professionnelId) {
    const professionnel = await prisma.professionnel.findUnique({ where: { id: input.professionnelId } });
    if (!professionnel) throw Errors.notFound("Professionnel introuvable");

    const distanceKm = await distanceToProfessionnel(input.professionnelId, input.latitude, input.longitude);
    if (distanceKm !== null) {
      const tarifParKm = await getParametreNombre("tarif_par_km", 300);
      prixEstime = calculerPrixEstime(Number(professionnel.tarifIndicatifMin ?? 0), distanceKm, tarifParKm);
    }
  }

  return prisma.demande.create({
    data: { clientId, ...input, prixEstime },
    include,
  });
}

export async function getDemande(id: string, userId: string, role: Role) {
  const demande = await prisma.demande.findUnique({ where: { id }, include });
  if (!demande) throw Errors.notFound("Demande introuvable");

  const isOwner =
    (role === "client" && demande.clientId === userId) ||
    (role === "professionnel" && demande.professionnelId === userId);
  if (!isOwner && role !== "administrateur") throw Errors.forbidden();

  return demande;
}

export async function listDemandes(userId: string, role: Role, filters: ListDemandesInput) {
  const skip = (filters.page - 1) * filters.limit;
  const where = {
    ...(role === "client" ? { clientId: userId } : { professionnelId: userId }),
    ...(filters.statut && { statut: filters.statut }),
  };

  const [demandes, total] = await Promise.all([
    prisma.demande.findMany({ where, include, orderBy: { createdAt: "desc" }, skip, take: filters.limit }),
    prisma.demande.count({ where }),
  ]);

  return { demandes, total };
}

// Qui peut faire quelle transition, depuis quel statut de départ.
const TRANSITIONS: Record<string, { from: string; actor: Role }> = {
  ACCEPTEE: { from: "EN_ATTENTE", actor: "professionnel" },
  REFUSEE: { from: "EN_ATTENTE", actor: "professionnel" },
  EN_ROUTE: { from: "ACCEPTEE", actor: "professionnel" },
  EN_COURS: { from: "EN_ROUTE", actor: "professionnel" },
  TERMINEE: { from: "EN_COURS", actor: "professionnel" },
};

const NON_TERMINAL = ["EN_ATTENTE", "ACCEPTEE", "EN_ROUTE", "EN_COURS"];

export async function updateStatut(id: string, userId: string, role: Role, input: UpdateStatutInput) {
  const demande = await prisma.demande.findUnique({ where: { id } });
  if (!demande) throw Errors.notFound("Demande introuvable");

  if (input.statut === "ANNULEE") {
    if (!NON_TERMINAL.includes(demande.statut)) {
      throw Errors.badRequest("Cette demande ne peut plus être annulée");
    }
    const isOwner =
      (role === "client" && demande.clientId === userId) ||
      (role === "professionnel" && demande.professionnelId === userId);
    if (!isOwner) throw Errors.forbidden();
    if (demande.statut !== "EN_ATTENTE" && !input.motif) {
      throw Errors.badRequest("Un motif est requis pour annuler une demande déjà acceptée");
    }
    return prisma.demande.update({
      where: { id },
      data: { statut: "ANNULEE", motifAnnulation: input.motif },
      include,
    });
  }

  const transition = TRANSITIONS[input.statut];
  if (!transition || demande.statut !== transition.from) {
    throw Errors.badRequest(`Transition ${demande.statut} -> ${input.statut} invalide`);
  }
  if (role !== transition.actor) throw Errors.forbidden();

  // Un professionnel ne peut agir que sur une demande qui lui est déjà assignée,
  // sauf pour ACCEPTEE sur une demande encore ouverte (professionnelId null),
  // auquel cas cette action l'assigne.
  if (role === "professionnel" && demande.professionnelId && demande.professionnelId !== userId) {
    throw Errors.forbidden("Cette demande est déjà assignée à un autre professionnel");
  }
  if (input.statut !== "ACCEPTEE" && demande.professionnelId !== userId) {
    throw Errors.forbidden();
  }

  const extraFields: Record<string, unknown> = {};
  if (input.statut === "ACCEPTEE") {
    extraFields.professionnelId = userId;
    extraFields.dateAcceptation = new Date();
  }
  if (input.statut === "EN_COURS") extraFields.dateDebut = new Date();
  if (input.statut === "TERMINEE") extraFields.dateFin = new Date();

  return prisma.demande.update({
    where: { id },
    data: { statut: input.statut, ...extraFields },
    include,
  });
}

// L'appel n'est possible que pendant l'engagement actif — pas avant acceptation,
// pas après la fin — pour ne jamais donner un accès permanent au numéro de l'autre.
const STATUTS_APPEL_AUTORISES = ["ACCEPTEE", "EN_ROUTE", "EN_COURS"];

export async function lancerAppel(demandeId: string, userId: string, role: Role) {
  if (role !== "client" && role !== "professionnel") throw Errors.forbidden();

  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: { client: true, professionnel: true },
  });
  if (!demande) throw Errors.notFound("Demande introuvable");

  const isOwner =
    (role === "client" && demande.clientId === userId) ||
    (role === "professionnel" && demande.professionnelId === userId);
  if (!isOwner) throw Errors.forbidden();

  if (!STATUTS_APPEL_AUTORISES.includes(demande.statut)) {
    throw Errors.badRequest("L'appel n'est disponible que pendant une intervention active");
  }
  if (!demande.professionnel) throw Errors.badRequest("Aucun professionnel assigné à cette demande");

  const [numeroAppelant, numeroAppele] =
    role === "client" ? [demande.client.telephone, demande.professionnel.telephone] : [demande.professionnel.telephone, demande.client.telephone];

  const provider = getTelephonieProvider();
  try {
    const { providerAppelId } = await provider.lancerAppel(numeroAppelant, numeroAppele);
    return prisma.appel.create({
      data: {
        demandeId,
        initiePar: role === "client" ? "CLIENT" : "PROFESSIONNEL",
        statut: "CONNECTE",
        providerAppelId,
      },
    });
  } catch (err) {
    await prisma.appel.create({
      data: { demandeId, initiePar: role === "client" ? "CLIENT" : "PROFESSIONNEL", statut: "ECHOUE" },
    });
    throw err;
  }
}

// Suivi temps réel : seulement pendant "en_route" (Volume 2 §5), dernière
// position écrasée à chaque appel, pas d'historique conservé.
export async function updatePosition(demandeId: string, professionnelId: string, input: UpdatePositionInput) {
  const demande = await prisma.demande.findUnique({ where: { id: demandeId } });
  if (!demande) throw Errors.notFound("Demande introuvable");
  if (demande.professionnelId !== professionnelId) throw Errors.forbidden();
  if (demande.statut !== "EN_ROUTE") {
    throw Errors.badRequest("La position ne se met à jour que pendant le trajet");
  }

  return prisma.demande.update({
    where: { id: demandeId },
    data: {
      professionnelLat: input.latitude,
      professionnelLng: input.longitude,
      positionMajAt: new Date(),
    },
    select: { professionnelLat: true, professionnelLng: true, positionMajAt: true },
  });
}
