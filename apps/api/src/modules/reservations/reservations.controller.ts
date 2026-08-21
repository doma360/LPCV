import type { Request, Response } from "express";
import { created, ok, okPaginated } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { parsePagination } from "@/utils/pagination.js";
import {
  confirmerReservationSchema,
  creerReservationSchema,
  envoyerMessageSchema,
  listReservationsSchema,
  payerReservationSchema,
} from "./reservations.schema.js";
import * as reservationsService from "./reservations.service.js";

export async function createHandler(req: Request, res: Response) {
  if (req.auth?.role !== "client") throw Errors.forbidden("Réservé aux clients");
  const input = creerReservationSchema.parse(req.body);
  const reservation = await reservationsService.createReservation(req.auth.sub, input);
  return created(res, reservation, "Réservation demandée");
}

export async function listHandler(req: Request, res: Response) {
  if (!req.auth || (req.auth.role !== "client" && req.auth.role !== "professionnel")) throw Errors.forbidden();
  const filters = listReservationsSchema.parse(req.query);
  const { skip } = parsePagination({ page: filters.page, limit: filters.limit });
  const { reservations, total } = await reservationsService.listReservations(req.auth.sub, req.auth.role, skip, filters.limit);
  return okPaginated(res, reservations, { page: filters.page, limit: filters.limit, total });
}

export async function getHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const reservation = await reservationsService.getReservation(req.params.id, req.auth.sub, req.auth.role);
  return ok(res, reservation);
}

export async function confirmerHandler(req: Request, res: Response) {
  if (req.auth?.role !== "professionnel") throw Errors.forbidden("Réservé aux professionnels");
  const input = confirmerReservationSchema.parse(req.body);
  const reservation = await reservationsService.confirmerReservation(req.params.id, req.auth.sub, input);
  return ok(res, reservation, "Réservation confirmée");
}

export async function refuserHandler(req: Request, res: Response) {
  if (req.auth?.role !== "professionnel") throw Errors.forbidden("Réservé aux professionnels");
  const reservation = await reservationsService.refuserReservation(req.params.id, req.auth.sub);
  return ok(res, reservation, "Réservation refusée");
}

export async function terminerHandler(req: Request, res: Response) {
  if (req.auth?.role !== "professionnel") throw Errors.forbidden("Réservé aux professionnels");
  const reservation = await reservationsService.terminerReservation(req.params.id, req.auth.sub);
  return ok(res, reservation, "Réservation marquée terminée");
}

export async function annulerHandler(req: Request, res: Response) {
  if (req.auth?.role !== "client") throw Errors.forbidden("Réservé aux clients");
  const reservation = await reservationsService.annulerReservation(req.params.id, req.auth.sub);
  return ok(res, reservation, "Réservation annulée");
}

export async function payerHandler(req: Request, res: Response) {
  if (req.auth?.role !== "client") throw Errors.forbidden("Réservé aux clients");
  const input = payerReservationSchema.parse(req.body);
  const paiement = await reservationsService.payerReservation(req.params.id, req.auth.sub, input);
  return created(res, paiement, "Paiement initié");
}

export async function listMessagesHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const messages = await reservationsService.listMessages(req.params.id, req.auth.sub, req.auth.role);
  return ok(res, messages);
}

export async function envoyerMessageHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const input = envoyerMessageSchema.parse(req.body);
  const message = await reservationsService.envoyerMessage(req.params.id, req.auth.sub, req.auth.role, input);
  return created(res, message, "Message envoyé");
}

export async function lancerAppelHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const appel = await reservationsService.lancerAppel(req.params.id, req.auth.sub, req.auth.role);
  return created(res, appel, "Appel lancé");
}
