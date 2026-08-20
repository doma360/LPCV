import type { Request, Response } from "express";
import { ok, okPaginated } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { parsePagination } from "@/utils/pagination.js";
import {
  changerStatutUtilisateurSchema,
  listPendingSchema,
  listUtilisateursSchema,
  moderationAvisSchema,
  verificationDecisionSchema,
} from "./admin.schema.js";
import * as adminService from "./admin.service.js";

export async function statsHandler(_req: Request, res: Response) {
  const stats = await adminService.getStats();
  return ok(res, stats);
}

export async function listPendingHandler(req: Request, res: Response) {
  const filters = listPendingSchema.parse(req.query);
  const { skip } = parsePagination({ page: filters.page, limit: filters.limit });
  const { professionnels, total } = await adminService.listPendingProfessionnels(skip, filters.limit);
  return okPaginated(res, professionnels, { page: filters.page, limit: filters.limit, total });
}

export async function decideVerificationHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const input = verificationDecisionSchema.parse(req.body);
  const professionnel = await adminService.decideVerification(req.params.id, req.auth.sub, input);
  return ok(res, professionnel, "Décision enregistrée");
}

export async function listAvisSignalesHandler(req: Request, res: Response) {
  const filters = listPendingSchema.parse(req.query);
  const { skip } = parsePagination({ page: filters.page, limit: filters.limit });
  const { avis, total } = await adminService.listAvisSignales(skip, filters.limit);
  return okPaginated(res, avis, { page: filters.page, limit: filters.limit, total });
}

export async function modererAvisHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const input = moderationAvisSchema.parse(req.body);
  const avis = await adminService.modererAvisSignale(req.params.id, req.auth.sub, input);
  return ok(res, avis, "Décision enregistrée");
}

export async function listUtilisateursHandler(req: Request, res: Response) {
  const filters = listUtilisateursSchema.parse(req.query);
  const { skip } = parsePagination({ page: filters.page, limit: filters.limit });
  const { utilisateurs, total } = await adminService.listUtilisateurs(filters, skip);
  return okPaginated(res, utilisateurs, { page: filters.page, limit: filters.limit, total });
}

export async function changerStatutUtilisateurHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  if (req.params.type !== "client" && req.params.type !== "professionnel") {
    throw Errors.badRequest("Type d'utilisateur invalide");
  }
  const input = changerStatutUtilisateurSchema.parse(req.body);
  const utilisateur = await adminService.changerStatutUtilisateur(req.params.type, req.params.id, req.auth.sub, input);
  return ok(res, utilisateur, "Statut mis à jour");
}
