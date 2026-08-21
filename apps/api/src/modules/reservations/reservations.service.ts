import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import type { Role } from "@/lib/jwt.js";
import { getParametreNombre } from "@/lib/parametres.js";
import { getPaiementProvider } from "@/lib/paiement/index.js";
import { getTelephonieProvider } from "@/lib/telephonie/index.js";
import { crediterPortefeuille } from "@/modules/portefeuille/portefeuille.service.js";
import type {
  ConfirmerReservationInput,
  CreerReservationInput,
  EnvoyerMessageInput,
  PayerReservationInput,
} from "./reservations.schema.js";

const include = {
  client: { select: { id: true, nom: true, prenom: true, telephone: true, photoUrl: true } },
  professionnel: { select: { id: true, nom: true, prenom: true, telephone: true, photoUrl: true } },
  profession: true,
  paiement: true,
} as const;

export async function createReservation(clientId: string, input: CreerReservationInput) {
  const professionnel = await prisma.professionnel.findUnique({ where: { id: input.professionnelId } });
  if (!professionnel) throw Errors.notFound("Professionnel introuvable");
  if (!professionnel.aLocal) throw Errors.badRequest("Ce professionnel ne propose pas de réservation");

  return prisma.reservation.create({
    data: {
      clientId,
      professionnelId: input.professionnelId,
      professionId: input.professionId,
      description: input.description,
      dateSouhaitee: input.dateSouhaitee,
    },
    include,
  });
}

export async function listReservations(userId: string, role: Role, skip: number, limit: number) {
  const where = role === "client" ? { clientId: userId } : { professionnelId: userId };
  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({ where, include, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.reservation.count({ where }),
  ]);
  return { reservations, total };
}

export async function getReservation(id: string, userId: string, role: Role) {
  const reservation = await prisma.reservation.findUnique({ where: { id }, include });
  if (!reservation) throw Errors.notFound("Réservation introuvable");
  if (!estProprietaire(reservation, userId, role)) throw Errors.forbidden();
  return reservation;
}

function estProprietaire(
  reservation: { clientId: string; professionnelId: string },
  userId: string,
  role: Role,
) {
  return (role === "client" && reservation.clientId === userId) || (role === "professionnel" && reservation.professionnelId === userId);
}

async function getReservationDuProfessionnel(id: string, professionnelId: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) throw Errors.notFound("Réservation introuvable");
  if (reservation.professionnelId !== professionnelId) throw Errors.forbidden();
  return reservation;
}

export async function confirmerReservation(id: string, professionnelId: string, input: ConfirmerReservationInput) {
  const reservation = await getReservationDuProfessionnel(id, professionnelId);
  if (reservation.statut !== "EN_ATTENTE") throw Errors.badRequest("Cette réservation a déjà été traitée");

  return prisma.reservation.update({
    where: { id },
    data: { statut: "CONFIRMEE", dateConfirmee: input.dateConfirmee, montant: input.montant },
    include,
  });
}

export async function refuserReservation(id: string, professionnelId: string) {
  const reservation = await getReservationDuProfessionnel(id, professionnelId);
  if (reservation.statut !== "EN_ATTENTE") throw Errors.badRequest("Cette réservation a déjà été traitée");

  return prisma.reservation.update({ where: { id }, data: { statut: "REFUSEE" }, include });
}

export async function terminerReservation(id: string, professionnelId: string) {
  const reservation = await getReservationDuProfessionnel(id, professionnelId);
  if (reservation.statut !== "PAYEE") throw Errors.badRequest("Seule une réservation payée peut être marquée terminée");

  return prisma.reservation.update({ where: { id }, data: { statut: "TERMINEE" }, include });
}

export async function annulerReservation(id: string, clientId: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) throw Errors.notFound("Réservation introuvable");
  if (reservation.clientId !== clientId) throw Errors.forbidden();
  if (!["EN_ATTENTE", "CONFIRMEE"].includes(reservation.statut)) {
    throw Errors.badRequest("Cette réservation ne peut plus être annulée");
  }

  return prisma.reservation.update({ where: { id }, data: { statut: "ANNULEE" }, include });
}

// Meme mecanique de commission que paiements.service.ts (flux deplacement),
// mais ici le paiement credite reellement le Portefeuille du professionnel.
export async function payerReservation(id: string, clientId: string, input: PayerReservationInput) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) throw Errors.notFound("Réservation introuvable");
  if (reservation.clientId !== clientId) throw Errors.forbidden();
  if (reservation.statut !== "CONFIRMEE") throw Errors.badRequest("Cette réservation n'est pas prête pour le paiement");
  if (!reservation.montant) throw Errors.badRequest("Aucun montant fixé pour cette réservation");

  const existant = await prisma.paiement.findUnique({ where: { reservationId: id } });
  if (existant) throw Errors.conflict("Un paiement existe déjà pour cette réservation");

  const montant = Number(reservation.montant);
  const tauxCommission = await getParametreNombre("taux_commission", 0.15);
  const commission = Math.round(montant * tauxCommission);
  const montantNet = montant - commission;

  const provider = getPaiementProvider();
  const { reference, confirmeImmediatement } = await provider.initierPaiement(montant, input.methode);

  const paiement = await prisma.paiement.create({
    data: {
      reservationId: id,
      montant,
      commission,
      montantNet,
      methode: input.methode,
      referenceExterne: reference,
      statut: confirmeImmediatement ? "CONFIRME" : "EN_ATTENTE",
      dateConfirmation: confirmeImmediatement ? new Date() : null,
    },
  });

  if (confirmeImmediatement) {
    await crediterPortefeuille(reservation.professionnelId, montantNet, id);
    await prisma.reservation.update({ where: { id }, data: { statut: "PAYEE" } });
  }

  return paiement;
}

export async function listMessages(reservationId: string, userId: string, role: Role) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw Errors.notFound("Réservation introuvable");
  if (!estProprietaire(reservation, userId, role)) throw Errors.forbidden();

  return prisma.message.findMany({ where: { reservationId }, orderBy: { createdAt: "asc" } });
}

export async function envoyerMessage(reservationId: string, userId: string, role: Role, input: EnvoyerMessageInput) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw Errors.notFound("Réservation introuvable");
  if (!estProprietaire(reservation, userId, role)) throw Errors.forbidden();
  if (!["EN_ATTENTE", "CONFIRMEE"].includes(reservation.statut)) {
    throw Errors.badRequest("La discussion n'est plus disponible pour cette réservation");
  }

  return prisma.message.create({
    data: {
      reservationId,
      clientId: role === "client" ? userId : null,
      professionnelId: role === "professionnel" ? userId : null,
      contenu: input.contenu,
    },
  });
}

// Meme esprit que l'appel masque du flux deplacement (demandes.service.ts),
// mais autorise pendant la negociation du RDV plutot que pendant l'intervention.
const STATUTS_APPEL_AUTORISES = ["EN_ATTENTE", "CONFIRMEE"];

export async function lancerAppel(reservationId: string, userId: string, role: Role) {
  if (role !== "client" && role !== "professionnel") throw Errors.forbidden();

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { client: true, professionnel: true },
  });
  if (!reservation) throw Errors.notFound("Réservation introuvable");
  if (!estProprietaire(reservation, userId, role)) throw Errors.forbidden();
  if (!STATUTS_APPEL_AUTORISES.includes(reservation.statut)) {
    throw Errors.badRequest("L'appel n'est disponible que pendant la prise de rendez-vous");
  }

  const [numeroAppelant, numeroAppele] =
    role === "client"
      ? [reservation.client.telephone, reservation.professionnel.telephone]
      : [reservation.professionnel.telephone, reservation.client.telephone];

  const provider = getTelephonieProvider();
  try {
    const { providerAppelId } = await provider.lancerAppel(numeroAppelant, numeroAppele);
    return prisma.appel.create({
      data: {
        reservationId,
        initiePar: role === "client" ? "CLIENT" : "PROFESSIONNEL",
        statut: "CONNECTE",
        providerAppelId,
      },
    });
  } catch (err) {
    await prisma.appel.create({
      data: { reservationId, initiePar: role === "client" ? "CLIENT" : "PROFESSIONNEL", statut: "ECHOUE" },
    });
    throw err;
  }
}
