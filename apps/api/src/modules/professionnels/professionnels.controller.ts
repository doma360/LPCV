import type { Request, Response } from "express";
import { ok, okPaginated } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { matchProfessionnelsSchema, searchProfessionnelsSchema, updateProfessionnelSchema } from "./professionnels.schema.js";
import * as professionnelsService from "./professionnels.service.js";

export async function searchHandler(req: Request, res: Response) {
  const input = searchProfessionnelsSchema.parse(req.query);
  const { results, page, limit } = await professionnelsService.searchProfessionnels(input);
  return okPaginated(res, results, { page, limit, total: results.length });
}

export async function matchHandler(req: Request, res: Response) {
  const input = matchProfessionnelsSchema.parse(req.query);
  const { candidats, rayonUtiliseKm } = await professionnelsService.matchProfessionnels(input);
  return ok(res, { candidats, rayonUtiliseKm });
}

export async function getHandler(req: Request, res: Response) {
  const professionnel = await professionnelsService.getProfessionnel(req.params.id);
  return ok(res, professionnel);
}

export async function updateHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  if (req.auth.role !== "professionnel" || req.auth.sub !== req.params.id) {
    throw Errors.forbidden("Vous ne pouvez modifier que votre propre profil");
  }
  const input = updateProfessionnelSchema.parse(req.body);
  const professionnel = await professionnelsService.updateProfessionnel(req.params.id, input);
  return ok(res, professionnel, "Profil mis à jour");
}
