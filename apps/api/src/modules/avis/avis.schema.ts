import { z } from "zod";

export const createAvisSchema = z.object({
  demandeId: z.string().uuid(),
  note: z.coerce.number().int().min(1).max(5),
  commentaire: z.string().max(1000).optional(),
});

export type CreateAvisInput = z.infer<typeof createAvisSchema>;

export const listAvisSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ListAvisInput = z.infer<typeof listAvisSchema>;
