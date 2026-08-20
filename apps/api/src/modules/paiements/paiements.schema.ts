import { z } from "zod";

export const createPaiementSchema = z.object({
  demandeId: z.string().uuid(),
  methode: z.enum(["WAVE", "ORANGE_MONEY", "MTN_MONEY", "MOOV_MONEY", "ESPECES"]),
});

export type CreatePaiementInput = z.infer<typeof createPaiementSchema>;
