import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import type { Role } from "@/lib/jwt.js";
import type { ChangerMotDePasseInput, UpdateMeInput } from "./users.schema.js";

const SALT_ROUNDS = 12;

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
  try {
    if (role === "client") return await prisma.client.update({ where: { id }, data: input });
    if (role === "professionnel") return await prisma.professionnel.update({ where: { id }, data: input });
    return await prisma.administrateur.update({ where: { id }, data: { nom: input.nom, prenom: input.prenom } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw Errors.conflict("Cet email ou ce numéro de téléphone est déjà utilisé");
    }
    throw err;
  }
}

export async function changerMotDePasse(id: string, role: Role, input: ChangerMotDePasseInput) {
  if (role !== "client" && role !== "professionnel") throw Errors.forbidden();

  const account =
    role === "client"
      ? await prisma.client.findUniqueOrThrow({ where: { id } }).catch(() => {
          throw Errors.notFound();
        })
      : await prisma.professionnel.findUniqueOrThrow({ where: { id } }).catch(() => {
          throw Errors.notFound();
        });

  const valide = await bcrypt.compare(input.motDePasseActuel, account.motDePasseHash);
  if (!valide) throw Errors.badRequest("Mot de passe actuel incorrect");

  const motDePasseHash = await bcrypt.hash(input.nouveauMotDePasse, SALT_ROUNDS);
  if (role === "client") await prisma.client.update({ where: { id }, data: { motDePasseHash } });
  else await prisma.professionnel.update({ where: { id }, data: { motDePasseHash } });

  return { message: "Mot de passe mis à jour" };
}

export async function desactiverCompte(id: string, role: Role) {
  if (role === "client") await prisma.client.update({ where: { id }, data: { statut: "SUSPENDU" } });
  else if (role === "professionnel") await prisma.professionnel.update({ where: { id }, data: { statut: "SUSPENDU" } });
  else throw Errors.forbidden();

  return { message: "Compte désactivé" };
}
