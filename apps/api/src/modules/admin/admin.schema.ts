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
