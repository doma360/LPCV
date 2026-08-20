import type { Request, Response } from "express";
import { created, ok, okPaginated } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { createDemandeSchema, listDemandesSchema, updatePositionSchema, updateStatutSchema } from "./demandes.schema.js";
import * as demandesService from "./demandes.service.js";

export async function createHandler(req: Request, res: Response) {
  if (req.auth?.role !== "client") throw Errors.forbidden("Réservé aux clients");
  const input = createDemandeSchema.parse(req.body);
  const demande = await demandesService.createDemande(req.auth.sub, input);
  return created(res, demande, "Demande créée");
}

export async function listHandler(req: Request, res: Response) {
  if (!req.auth || (req.auth.role !== "client" && req.auth.role !== "professionnel")) {
    throw Errors.forbidden();
  }
  const filters = listDemandesSchema.parse(req.query);
  const { demandes, total } = await demandesService.listDemandes(req.auth.sub, req.auth.role, filters);
  return okPaginated(res, demandes, { page: filters.page, limit: filters.limit, total });
}

export async function getHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const demande = await demandesService.getDemande(req.params.id, req.auth.sub, req.auth.role);
  return ok(res, demande);
}

export async function updateStatutHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const input = updateStatutSchema.parse(req.body);
  const demande = await demandesService.updateStatut(req.params.id, req.auth.sub, req.auth.role, input);
  return ok(res, demande, "Statut mis à jour");
}

export async function lancerAppelHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const appel = await demandesService.lancerAppel(req.params.id, req.auth.sub, req.auth.role);
  return created(res, appel, "Appel lancé");
}

export async function updatePositionHandler(req: Request, res: Response) {
  if (req.auth?.role !== "professionnel") throw Errors.forbidden("Réservé aux professionnels");
  const input = updatePositionSchema.parse(req.body);
  const position = await demandesService.updatePosition(req.params.id, req.auth.sub, input);
  return ok(res, position);
}
