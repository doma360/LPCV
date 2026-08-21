import type { Request, Response } from "express";
import { ok } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import * as abonnementsService from "./abonnements.service.js";

export async function getMonAbonnementHandler(req: Request, res: Response) {
  if (req.auth?.role !== "professionnel") throw Errors.forbidden("Réservé aux professionnels");
  const abonnement = await abonnementsService.getAbonnement(req.auth.sub);
  return ok(res, abonnement);
}
