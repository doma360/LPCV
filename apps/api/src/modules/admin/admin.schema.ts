import { z } from "zod";

export const verificationDecisionSchema = z.object({
  decision: z.enum(["VERIFIE", "REFUSE"]),
});

export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;

export const listPendingSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ListPendingInput = z.infer<typeof listPendingSchema>;

export const moderationAvisSchema = z.object({
  decision: z.enum(["APPROUVE", "MASQUE"]),
});

export type ModerationAvisInput = z.infer<typeof moderationAvisSchema>;

export const listUtilisateursSchema = z.object({
  type: z.enum(["client", "professionnel"]),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ListUtilisateursInput = z.infer<typeof listUtilisateursSchema>;

export const changerStatutUtilisateurSchema = z.object({
  statut: z.enum(["ACTIF", "SUSPENDU"]),
});

export type ChangerStatutUtilisateurInput = z.infer<typeof changerStatutUtilisateurSchema>;
