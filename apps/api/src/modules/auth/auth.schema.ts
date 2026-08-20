import { z } from "zod";

const baseFields = {
  nom: z.string().min(1).max(80),
  prenom: z.string().min(1).max(80),
  email: z.string().email(),
  telephone: z.string().min(8).max(20),
  motDePasse: z.string().min(8, "8 caractères minimum"),
};

export const registerSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("client"), ...baseFields }),
  z.object({
    role: z.literal("professionnel"),
    ...baseFields,
    professionId: z.string().uuid(),
  }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifiant: z.string().min(1, "Email ou téléphone requis"),
  motDePasse: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export const motDePasseOublieSchema = z.object({
  identifiant: z.string().min(1, "Email ou téléphone requis"),
});

export type MotDePasseOublieInput = z.infer<typeof motDePasseOublieSchema>;

export const reinitialiserMotDePasseSchema = z.object({
  identifiant: z.string().min(1, "Email ou téléphone requis"),
  code: z.string().length(6, "Code à 6 chiffres"),
  nouveauMotDePasse: z.string().min(8, "8 caractères minimum"),
});

export type ReinitialiserMotDePasseInput = z.infer<typeof reinitialiserMotDePasseSchema>;
