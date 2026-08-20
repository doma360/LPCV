import { z } from "zod";

export const createDemandeSchema = z.object({
  professionId: z.string().uuid(),
  professionnelId: z.string().uuid().optional(),
  description: z.string().min(10).max(2000),
  adresse: z.string().min(3).max(300),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  photosUrls: z.array(z.string().url()).max(10).default([]),
});

export type CreateDemandeInput = z.infer<typeof createDemandeSchema>;

export const updateStatutSchema = z.object({
  statut: z.enum(["ACCEPTEE", "EN_ROUTE", "EN_COURS", "TERMINEE", "ANNULEE", "REFUSEE"]),
  motif: z.string().min(3).max(500).optional(),
});

export type UpdateStatutInput = z.infer<typeof updateStatutSchema>;

export const listDemandesSchema = z.object({
  statut: z.enum(["EN_ATTENTE", "ACCEPTEE", "EN_ROUTE", "EN_COURS", "TERMINEE", "ANNULEE", "REFUSEE"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ListDemandesInput = z.infer<typeof listDemandesSchema>;

export const updatePositionSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
