import type { Request, Response } from "express";
import { created, ok, okPaginated } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { createAvisSchema, listAvisSchema } from "./avis.schema.js";
import * as avisService from "./avis.service.js";
import { parsePagination } from "@/utils/pagination.js";

export async function createHandler(req: Request, res: Response) {
  if (req.auth?.role !== "client") throw Errors.forbidden("Réservé aux clients");
  const input = createAvisSchema.parse(req.body);
  const avis = await avisService.createAvis(req.auth.sub, input);
  return created(res, avis, "Avis publié");
}

export async function listMesAvisHandler(req: Request, res: Response) {
  if (req.auth?.role !== "client") throw Errors.forbidden("Réservé aux clients");
  const filters = listAvisSchema.parse(req.query);
  const { skip } = parsePagination({ page: filters.page, limit: filters.limit });
  const { avis, total } = await avisService.listAvisClient(req.auth.sub, skip, filters.limit);
  return okPaginated(res, avis, { page: filters.page, limit: filters.limit, total });
}

export async function listForProfessionnelHandler(req: Request, res: Response) {
  const filters = listAvisSchema.parse(req.query);
  const { skip } = parsePagination({ page: filters.page, limit: filters.limit });
  const { avis, total } = await avisService.listAvisProfessionnel(req.params.id, skip, filters.limit);
  return okPaginated(res, avis, { page: filters.page, limit: filters.limit, total });
}

export async function signalerHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const avis = await avisService.signalerAvis(req.params.id);
  return ok(res, avis, "Avis signalé, masqué en attendant une décision administrateur");
}
