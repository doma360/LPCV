import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt.js";
import { Errors } from "@/utils/errors.js";
import { getNotificationProvider } from "@/lib/notification/index.js";
import type { LoginInput, MotDePasseOublieInput, ReinitialiserMotDePasseInput, RegisterInput } from "./auth.schema.js";

const SALT_ROUNDS = 12;
const CODE_VALIDITE_MS = 15 * 60 * 1000;

function tokensFor(id: string, role: "client" | "professionnel" | "administrateur") {
  const payload = { sub: id, role };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
}

export async function register(input: RegisterInput) {
  const motDePasseHash = await bcrypt.hash(input.motDePasse, SALT_ROUNDS);

  try {
    if (input.role === "client") {
      const client = await prisma.client.create({
        data: {
          nom: input.nom,
          prenom: input.prenom,
          email: input.email,
          telephone: input.telephone,
          motDePasseHash,
        },
      });
      return { user: client, role: "client" as const, ...tokensFor(client.id, "client") };
    }

    const professionnel = await prisma.professionnel.create({
      data: {
        nom: input.nom,
        prenom: input.prenom,
        email: input.email,
        telephone: input.telephone,
        motDePasseHash,
        professionId: input.professionId,
      },
    });
    return {
      user: professionnel,
      role: "professionnel" as const,
      ...tokensFor(professionnel.id, "professionnel"),
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw Errors.conflict("Cet email ou ce numéro de téléphone est déjà utilisé");
    }
    throw err;
  }
}

async function findAccountByIdentifiant(identifiant: string) {
  const client = await prisma.client.findFirst({
    where: { OR: [{ email: identifiant }, { telephone: identifiant }] },
  });
  if (client) return { account: client, role: "client" as const };

  const professionnel = await prisma.professionnel.findFirst({
    where: { OR: [{ email: identifiant }, { telephone: identifiant }] },
  });
  if (professionnel) return { account: professionnel, role: "professionnel" as const };

  const administrateur = await prisma.administrateur.findFirst({
    where: { OR: [{ email: identifiant }, { telephone: identifiant }] },
  });
  if (administrateur) return { account: administrateur, role: "administrateur" as const };

  return null;
}

export async function login(input: LoginInput) {
  const found = await findAccountByIdentifiant(input.identifiant);
  if (!found) throw Errors.unauthorized("Identifiants invalides");

  const { account, role } = found;
  const valid = await bcrypt.compare(input.motDePasse, account.motDePasseHash);
  if (!valid) throw Errors.unauthorized("Identifiants invalides");

  if ("statut" in account && account.statut === "SUSPENDU") {
    throw Errors.forbidden("Ce compte est suspendu");
  }

  if (role === "client") {
    await prisma.client.update({ where: { id: account.id }, data: { derniereConnexionAt: new Date() } });
  } else if (role === "professionnel") {
    await prisma.professionnel.update({ where: { id: account.id }, data: { derniereConnexionAt: new Date() } });
  }

  return { user: account, role, ...tokensFor(account.id, role) };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw Errors.unauthorized("Jeton de rafraîchissement invalide ou expiré");
  }
  return tokensFor(payload.sub, payload.role);
}

// Réponse volontairement identique que le compte existe ou non, pour ne pas
// révéler quels emails/téléphones sont inscrits (énumération de comptes).
export async function demanderReinitialisation(input: MotDePasseOublieInput) {
  const found = await findAccountByIdentifiant(input.identifiant);

  if (found && found.role !== "administrateur") {
    const { account, role } = found;
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const resetTokenExpireAt = new Date(Date.now() + CODE_VALIDITE_MS);

    if (role === "client") {
      await prisma.client.update({ where: { id: account.id }, data: { resetTokenHash: codeHash, resetTokenExpireAt } });
    } else {
      await prisma.professionnel.update({ where: { id: account.id }, data: { resetTokenHash: codeHash, resetTokenExpireAt } });
    }

    await getNotificationProvider().envoyerCode(input.identifiant, code);
  }

  return { message: "Si un compte existe, un code de réinitialisation vient d'être envoyé." };
}

export async function reinitialiserMotDePasse(input: ReinitialiserMotDePasseInput) {
  const found = await findAccountByIdentifiant(input.identifiant);
  if (!found || found.role === "administrateur") throw Errors.badRequest("Code invalide ou expiré");

  const { account, role } = found;
  if (!account.resetTokenHash || !account.resetTokenExpireAt || account.resetTokenExpireAt < new Date()) {
    throw Errors.badRequest("Code invalide ou expiré");
  }

  const valide = await bcrypt.compare(input.code, account.resetTokenHash);
  if (!valide) throw Errors.badRequest("Code invalide ou expiré");

  const motDePasseHash = await bcrypt.hash(input.nouveauMotDePasse, SALT_ROUNDS);

  if (role === "client") {
    await prisma.client.update({
      where: { id: account.id },
      data: { motDePasseHash, resetTokenHash: null, resetTokenExpireAt: null },
    });
  } else {
    await prisma.professionnel.update({
      where: { id: account.id },
      data: { motDePasseHash, resetTokenHash: null, resetTokenExpireAt: null },
    });
  }

  return { message: "Mot de passe mis à jour" };
}
