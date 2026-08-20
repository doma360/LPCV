import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import type { Role } from "@/lib/jwt.js";
import type { UpdateMeInput } from "./users.schema.js";

export async function getMe(id: string, role: Role) {
  if (role === "client") return prisma.client.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Errors.notFound();
  });
  if (role === "professionnel")
    return prisma.professionnel
      .findUniqueOrThrow({ where: { id }, include: { profession: true, zones: { include: { zone: true } } } })
      .catch(() => {
        throw Errors.notFound();
      });
  return prisma.administrateur.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Errors.notFound();
  });
}

export async function updateMe(id: string, role: Role, input: UpdateMeInput) {
  if (role === "client") return prisma.client.update({ where: { id }, data: input });
  if (role === "professionnel") return prisma.professionnel.update({ where: { id }, data: input });
  return prisma.administrateur.update({ where: { id }, data: { nom: input.nom, prenom: input.prenom } });
}
