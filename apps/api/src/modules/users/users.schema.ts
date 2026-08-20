import { z } from "zod";

export const updateMeSchema = z.object({
  nom: z.string().min(1).max(80).optional(),
  prenom: z.string().min(1).max(80).optional(),
  email: z.string().email().optional(),
  telephone: z.string().min(8).max(20).optional(),
  photoUrl: z.string().url().optional(),
  notificationsActives: z.boolean().optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export const changerMotDePasseSchema = z.object({
  motDePasseActuel: z.string().min(1),
  nouveauMotDePasse: z.string().min(8, "8 caractères minimum"),
});

export type ChangerMotDePasseInput = z.infer<typeof changerMotDePasseSchema>;
