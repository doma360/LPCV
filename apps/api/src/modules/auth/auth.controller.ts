import type { Request, Response } from "express";
import { created, ok } from "@/utils/response.js";
import {
  loginSchema,
  motDePasseOublieSchema,
  refreshSchema,
  registerSchema,
  reinitialiserMotDePasseSchema,
} from "./auth.schema.js";
import * as authService from "./auth.service.js";

function sanitize<T extends { motDePasseHash: string }>(account: T) {
  const { motDePasseHash: _motDePasseHash, ...rest } = account;
  return rest;
}

export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const { user, role, accessToken, refreshToken } = await authService.register(input);
  return created(res, { user: sanitize(user), role, accessToken, refreshToken }, "Compte créé");
}

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { user, role, accessToken, refreshToken } = await authService.login(input);
  return ok(res, { user: sanitize(user), role, accessToken, refreshToken }, "Connecté");
}

export async function refreshHandler(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  const tokens = await authService.refresh(refreshToken);
  return ok(res, tokens, "Jeton rafraîchi");
}

export async function motDePasseOublieHandler(req: Request, res: Response) {
  const input = motDePasseOublieSchema.parse(req.body);
  const result = await authService.demanderReinitialisation(input);
  return ok(res, null, result.message);
}

export async function reinitialiserMotDePasseHandler(req: Request, res: Response) {
  const input = reinitialiserMotDePasseSchema.parse(req.body);
  const result = await authService.reinitialiserMotDePasse(input);
  return ok(res, null, result.message);
}
