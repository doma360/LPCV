import type { Request, Response } from "express";
import { ok, okPaginated } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { parsePagination } from "@/utils/pagination.js";
import { listPendingSchema, verificationDecisionSchema } from "./admin.schema.js";
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
