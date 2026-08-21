import type { Request, Response } from "express";
import { z } from "zod";
import { ok } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import * as portefeuilleService from "./portefeuille.service.js";

const retraitSchema = z.object({ montant: z.coerce.number().positive() });

export async function getMonPortefeuilleHandler(req: Request, res: Response) {
  if (req.auth?.role !== "professionnel") throw Errors.forbidden("Réservé aux professionnels");
  const portefeuille = await portefeuilleService.getMonPortefeuille(req.auth.sub);
  return ok(res, portefeuille);
}

export async function demanderRetraitHandler(req: Request, res: Response) {
  if (req.auth?.role !== "professionnel") throw Errors.forbidden("Réservé aux professionnels");
  const input = retraitSchema.parse(req.body);
  const portefeuille = await portefeuilleService.demanderRetrait(req.auth.sub, input.montant);
  return ok(res, portefeuille, "Retrait effectué");
}
