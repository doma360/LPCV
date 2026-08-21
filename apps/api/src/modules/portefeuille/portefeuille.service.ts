import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";

async function getOuCreerPortefeuille(professionnelId: string) {
  const existant = await prisma.portefeuille.findUnique({ where: { professionnelId } });
  if (existant) return existant;
  return prisma.portefeuille.create({ data: { professionnelId } });
}

// Appele depuis reservations.service.ts au moment ou un paiement de
// reservation est confirme - jamais depuis le flux de deplacement (Demande),
// qui ne transite pas reellement par la plateforme (voir docs/decisions.md).
export async function crediterPortefeuille(professionnelId: string, montant: number, reservationId: string) {
  const portefeuille = await getOuCreerPortefeuille(professionnelId);
  const [maj] = await prisma.$transaction([
    prisma.portefeuille.update({ where: { id: portefeuille.id }, data: { solde: { increment: montant } } }),
    prisma.mouvementPortefeuille.create({
      data: { portefeuilleId: portefeuille.id, type: "CREDIT_RESERVATION", montant, reservationId },
    }),
  ]);
  return maj;
}

export async function getMonPortefeuille(professionnelId: string) {
  const portefeuille = await getOuCreerPortefeuille(professionnelId);
  const mouvements = await prisma.mouvementPortefeuille.findMany({
    where: { portefeuilleId: portefeuille.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return { ...portefeuille, mouvements };
}

// Retrait mocke (voir docs/decisions.md - portefeuille prevu via Mobile Money,
// aucun agregateur reel branche pour l'instant) : decremente immediatement,
// comme un retrait toujours accepte.
export async function demanderRetrait(professionnelId: string, montant: number) {
  const portefeuille = await getOuCreerPortefeuille(professionnelId);
  if (Number(portefeuille.solde) < montant) throw Errors.badRequest("Solde insuffisant pour ce retrait");

  const [maj] = await prisma.$transaction([
    prisma.portefeuille.update({ where: { id: portefeuille.id }, data: { solde: { decrement: montant } } }),
    prisma.mouvementPortefeuille.create({
      data: { portefeuilleId: portefeuille.id, type: "RETRAIT", montant },
    }),
  ]);
  return maj;
}
