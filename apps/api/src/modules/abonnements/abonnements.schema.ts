import { z } from "zod";

export const accorderAbonnementSchema = z.object({
  palier: z.enum(["MENSUEL", "ANNUEL"]),
});

export type AccorderAbonnementInput = z.infer<typeof accorderAbonnementSchema>;
