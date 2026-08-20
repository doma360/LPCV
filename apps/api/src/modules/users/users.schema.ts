import { z } from "zod";

export const updateMeSchema = z.object({
  nom: z.string().min(1).max(80).optional(),
  prenom: z.string().min(1).max(80).optional(),
  photoUrl: z.string().url().optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
