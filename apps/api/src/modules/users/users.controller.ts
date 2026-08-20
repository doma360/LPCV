import type { Request, Response } from "express";
import { ok } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { updateMeSchema } from "./users.schema.js";
import * as usersService from "./users.service.js";

function sanitize<T extends { motDePasseHash?: string }>(account: T) {
  const { motDePasseHash: _motDePasseHash, ...rest } = account;
  return rest;
}

export async function getMeHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const account = await usersService.getMe(req.auth.sub, req.auth.role);
  return ok(res, sanitize(account));
}

export async function updateMeHandler(req: Request, res: Response) {
  if (!req.auth) throw Errors.unauthorized();
  const input = updateMeSchema.parse(req.body);
  const account = await usersService.updateMe(req.auth.sub, req.auth.role, input);
  return ok(res, sanitize(account), "Profil mis à jour");
}
