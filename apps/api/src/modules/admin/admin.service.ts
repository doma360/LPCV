import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import type { VerificationDecisionInput } from "./admin.schema.js";

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

  return misAJour;
}
