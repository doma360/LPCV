import type { Request, Response } from "express";
import { created, ok } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { createPaiementSchema } from "./paiements.schema.js";
import * as paiementsService from "./paiements.service.js";

export async function createHandler(req: Request, res: Response) {
  if (req.auth?.role !== "client") throw Errors.forbidden("Réservé aux clients");
  const input = createPaiementSchema.parse(req.body);
  const paiement = await paiementsService.createPaiement(req.auth.sub, input);
  return created(res, paiement, "Paiement initié");
}

export async function getHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const paiement = await paiementsService.getPaiement(req.params.id, req.auth.sub, req.auth.role);
  return ok(res, paiement);
}

export async function confirmerEspecesHandler(req: Request, res: Response) {
  if (req.auth?.role !== "professionnel") throw Errors.forbidden("Réservé au professionnel de la demande");
  const paiement = await paiementsService.confirmerPaiementEspeces(req.params.id, req.auth.sub);
  return ok(res, paiement, "Paiement en espèces confirmé");
}
