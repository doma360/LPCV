import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt.js";
import { Errors } from "@/utils/errors.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const SALT_ROUNDS = 12;

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
