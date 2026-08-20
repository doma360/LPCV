import type { Request, Response } from "express";

export function notImplemented(req: Request, res: Response) {
  res.status(501).json({
    success: false,
    data: null,
    message: `${req.method} ${req.baseUrl}${req.path} n'est pas encore implémenté`,
  });
}
