import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken, type Role } from "@/lib/jwt.js";
import { Errors } from "@/utils/errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(Errors.unauthorized());
  }

  try {
    req.auth = verifyAccessToken(header.slice("Bearer ".length));
    return next();
  } catch {
    return next(Errors.unauthorized("Jeton invalide ou expiré"));
  }
}

export function requireRole(...roles: Role[]) {
  return function checkRole(req: Request, _res: Response, next: NextFunction) {
    if (!req.auth) return next(Errors.unauthorized());
    if (!roles.includes(req.auth.role)) return next(Errors.forbidden());
    return next();
  };
}
