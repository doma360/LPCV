import type { Request, Response } from "express";
import { created, ok, okPaginated } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import {
  createDisponibiliteSchema,
  matchProfessionnelsSchema,
  portfolioPhotoSchema,
  searchProfessionnelsSchema,
  updateProfessionnelSchema,
} from "./professionnels.schema.js";
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

function requireProfessionnel(req: Request) {
  if (!req.auth || req.auth.role !== "professionnel") throw Errors.forbidden("Réservé aux professionnels");
  return req.auth.sub;
}

export async function listDisponibilitesHandler(req: Request, res: Response) {
  const professionnelId = requireProfessionnel(req);
  const disponibilites = await professionnelsService.listDisponibilites(professionnelId);
  return ok(res, disponibilites);
}

export async function createDisponibiliteHandler(req: Request, res: Response) {
  const professionnelId = requireProfessionnel(req);
  const input = createDisponibiliteSchema.parse(req.body);
  const disponibilite = await professionnelsService.createDisponibilite(professionnelId, input);
  return created(res, disponibilite, "Créneau ajouté");
}

export async function deleteDisponibiliteHandler(req: Request, res: Response) {
  const professionnelId = requireProfessionnel(req);
  await professionnelsService.deleteDisponibilite(req.params.id, professionnelId);
  return ok(res, null, "Créneau supprimé");
}

export async function revenusHandler(req: Request, res: Response) {
  const professionnelId = requireProfessionnel(req);
  const revenus = await professionnelsService.getRevenus(professionnelId);
  return ok(res, revenus);
}

export async function ajouterPhotoPortfolioHandler(req: Request, res: Response) {
  const professionnelId = requireProfessionnel(req);
  const { url } = portfolioPhotoSchema.parse(req.body);
  const result = await professionnelsService.ajouterPhotoPortfolio(professionnelId, url);
  return created(res, result, "Photo ajoutée au portfolio");
}

export async function retirerPhotoPortfolioHandler(req: Request, res: Response) {
  const professionnelId = requireProfessionnel(req);
  const { url } = portfolioPhotoSchema.parse(req.body);
  const result = await professionnelsService.retirerPhotoPortfolio(professionnelId, url);
  return ok(res, result, "Photo retirée du portfolio");
}
