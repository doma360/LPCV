import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import type { Role } from "@/lib/jwt.js";
import { getParametreNombre } from "@/lib/parametres.js";
import { getPaiementProvider } from "@/lib/paiement/index.js";
import type { CreatePaiementInput } from "./paiements.schema.js";

export async function createPaiement(clientId: string, input: CreatePaiementInput) {
  const demande = await prisma.demande.findUnique({ where: { id: input.demandeId } });
  if (!demande) throw Errors.notFound("Demande introuvable");
  if (demande.clientId !== clientId) throw Errors.forbidden();
  if (demande.statut !== "TERMINEE") {
    throw Errors.badRequest("Le paiement n'est possible qu'une fois l'intervention terminée");
  }
  if (!demande.prixEstime) throw Errors.badRequest("Aucun montant à payer pour cette demande");

  const existant = await prisma.paiement.findUnique({ where: { demandeId: input.demandeId } });
  if (existant) throw Errors.conflict("Un paiement existe déjà pour cette demande");

  const montant = Number(demande.prixEstime);
  const tauxCommission = await getParametreNombre("taux_commission", 0.15);
  const commission = Math.round(montant * tauxCommission);
  const montantNet = montant - commission;

  // Espèces : pas d'agrégateur, le professionnel confirmera la réception à la main.
  if (input.methode === "ESPECES") {
    return prisma.paiement.create({
      data: { demandeId: input.demandeId, montant, commission, montantNet, methode: input.methode, statut: "EN_ATTENTE" },
    });
  }

  const provider = getPaiementProvider();
  const { reference, confirmeImmediatement } = await provider.initierPaiement(montant, input.methode);

  return prisma.paiement.create({
    data: {
      demandeId: input.demandeId,
      montant,
      commission,
      montantNet,
      methode: input.methode,
      referenceExterne: reference,
      statut: confirmeImmediatement ? "CONFIRME" : "EN_ATTENTE",
      dateConfirmation: confirmeImmediatement ? new Date() : null,
    },
  });
}

// ESPECES n'existe que sur le flux deplacement (Demande) - une reservation
// passe toujours par un vrai paiement en ligne (voir reservations.schema.ts).
export async function confirmerPaiementEspeces(paiementId: string, professionnelId: string) {
  const paiement = await prisma.paiement.findUnique({ where: { id: paiementId }, include: { demande: true } });
  if (!paiement || !paiement.demande) throw Errors.notFound("Paiement introuvable");
  if (paiement.demande.professionnelId !== professionnelId) throw Errors.forbidden();
  if (paiement.methode !== "ESPECES") throw Errors.badRequest("Cette confirmation ne concerne que les paiements en espèces");
  if (paiement.statut !== "EN_ATTENTE") throw Errors.badRequest("Ce paiement n'est plus en attente");

  return prisma.paiement.update({
    where: { id: paiementId },
    data: { statut: "CONFIRME", dateConfirmation: new Date() },
  });
}

export async function getPaiement(id: string, userId: string, role: Role) {
  const paiement = await prisma.paiement.findUnique({ where: { id }, include: { demande: true, reservation: true } });
  if (!paiement) throw Errors.notFound("Paiement introuvable");

  const engagement = paiement.demande ?? paiement.reservation;
  const isOwner =
    !!engagement &&
    ((role === "client" && engagement.clientId === userId) ||
      (role === "professionnel" && engagement.professionnelId === userId));
  if (!isOwner && role !== "administrateur") throw Errors.forbidden();

  return paiement;
}
