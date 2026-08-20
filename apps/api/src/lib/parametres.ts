import { prisma } from "@/lib/prisma.js";

export async function getParametreNombre(cle: string, defaut: number): Promise<number> {
  const parametre = await prisma.parametrePlateforme.findUnique({ where: { cle } });
  if (!parametre) return defaut;
  const valeur = Number(parametre.valeur);
  return Number.isFinite(valeur) ? valeur : defaut;
}
