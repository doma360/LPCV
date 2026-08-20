import type { Request, Response } from "express";
import { created, ok } from "@/utils/response.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema.js";
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
