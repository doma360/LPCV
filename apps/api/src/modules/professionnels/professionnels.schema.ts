import { z } from "zod";

export const searchProfessionnelsSchema = z.object({
  metier: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  rayonKm: z.coerce.number().positive().max(100).default(15),
  prixMax: z.coerce.number().positive().optional(),
  noteMin: z.coerce.number().min(0).max(5).optional(),
  tri: z.enum(["distance", "prix", "note"]).default("distance"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type SearchProfessionnelsInput = z.infer<typeof searchProfessionnelsSchema>;

export const matchProfessionnelsSchema = z.object({
  metier: z.string().min(1),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  limit: z.coerce.number().int().positive().max(20).default(5),
});

export type MatchProfessionnelsInput = z.infer<typeof matchProfessionnelsSchema>;

export const updateProfessionnelSchema = z.object({
  presentation: z.string().max(2000).optional(),
  tarifIndicatifMin: z.coerce.number().positive().optional(),
  tarifIndicatifMax: z.coerce.number().positive().optional(),
  photoUrl: z.string().url().optional(),
  zoneIds: z.array(z.string().uuid()).optional(),
});

export type UpdateProfessionnelInput = z.infer<typeof updateProfessionnelSchema>;

const HEURE_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createDisponibiliteSchema = z.object({
  jour: z.enum(["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"]),
  heureDebut: z.string().regex(HEURE_REGEX, "Format attendu HH:mm"),
  heureFin: z.string().regex(HEURE_REGEX, "Format attendu HH:mm"),
});

export type CreateDisponibiliteInput = z.infer<typeof createDisponibiliteSchema>;
