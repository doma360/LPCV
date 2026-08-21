import { z } from "zod";

export const creerReservationSchema = z.object({
  professionnelId: z.string().uuid(),
  professionId: z.string().uuid(),
  description: z.string().trim().min(10).max(2000),
  dateSouhaitee: z.coerce.date().optional(),
});

export type CreerReservationInput = z.infer<typeof creerReservationSchema>;

export const listReservationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ListReservationsInput = z.infer<typeof listReservationsSchema>;

export const confirmerReservationSchema = z.object({
  dateConfirmee: z.coerce.date(),
  montant: z.coerce.number().positive(),
});

export type ConfirmerReservationInput = z.infer<typeof confirmerReservationSchema>;

// ESPECES exclu : une reservation implique toujours un vrai paiement en ligne
// (voir docs/decisions.md), contrairement au flux de deplacement.
export const payerReservationSchema = z.object({
  methode: z.enum(["WAVE", "ORANGE_MONEY", "MTN_MONEY", "MOOV_MONEY"]),
});

export type PayerReservationInput = z.infer<typeof payerReservationSchema>;

export const envoyerMessageSchema = z.object({
  contenu: z.string().trim().min(1).max(2000),
});

export type EnvoyerMessageInput = z.infer<typeof envoyerMessageSchema>;
