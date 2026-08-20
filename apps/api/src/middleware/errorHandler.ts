import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "@/utils/errors.js";
import type { Logger } from "pino";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, data: null, message: `Route introuvable : ${req.method} ${req.path}` });
}

export function errorHandler(logger: Logger) {
  return function handle(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Erreur de validation",
        errors: err.flatten().fieldErrors,
      });
    }

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ success: false, data: null, message: err.message });
    }

    logger.error({ err }, "Erreur serveur inattendue");
    return res.status(500).json({ success: false, data: null, message: "Erreur serveur inattendue" });
  };
}
