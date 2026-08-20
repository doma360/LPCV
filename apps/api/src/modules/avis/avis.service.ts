import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import type { CreateAvisInput } from "./avis.schema.js";

async function recalculerNote(professionnelId: string) {
  const agg = await prisma.avis.aggregate({
    where: { professionnelId, statut: "VISIBLE" },
    _avg: { note: true },
    _count: true,
  });
  const noteMoyenne = agg._avg.note ? Math.round(agg._avg.note * 10) / 10 : 0;
  await prisma.professionnel.update({
    where: { id: professionnelId },
    data: { noteMoyenne, nombreAvis: agg._count },
  });
}

export async function createAvis(clientId: string, input: CreateAvisInput) {
  const demande = await prisma.demande.findUnique({ where: { id: input.demandeId } });
  if (!demande) throw Errors.notFound("Demande introuvable");
  if (demande.clientId !== clientId) throw Errors.forbidden();
  if (demande.statut !== "TERMINEE") {
    throw Errors.badRequest("Un avis ne peut être laissé qu'après une intervention terminée");
  }
  if (!demande.professionnelId) throw Errors.badRequest("Aucun professionnel associé à cette demande");

  const existant = await prisma.avis.findUnique({ where: { demandeId: input.demandeId } });
  if (existant) throw Errors.conflict("Un avis a déjà été laissé pour cette demande");

  const avis = await prisma.avis.create({
    data: {
      demandeId: input.demandeId,
      clientId,
      professionnelId: demande.professionnelId,
      note: input.note,
      commentaire: input.commentaire,
    },
  });

  await recalculerNote(demande.professionnelId);
  return avis;
}

export async function listAvisProfessionnel(professionnelId: string, skip: number, limit: number) {
  const where = { professionnelId, statut: "VISIBLE" as const };
  const [avis, total] = await Promise.all([
    prisma.avis.findMany({
      where,
      include: { client: { select: { nom: true, prenom: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.avis.count({ where }),
  ]);
  return { avis, total };
}

export async function signalerAvis(avisId: string) {
  const avis = await prisma.avis.findUnique({ where: { id: avisId } });
  if (!avis) throw Errors.notFound("Avis introuvable");

  const misAJour = await prisma.avis.update({ where: { id: avisId }, data: { statut: "SIGNALE" } });
  await recalculerNote(avis.professionnelId);
  return misAJour;
}
