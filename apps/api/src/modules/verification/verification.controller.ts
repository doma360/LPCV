import type { Request, Response } from "express";
import { ok } from "@/utils/response.js";
import * as verificationService from "./verification.service.js";

export async function getCarteVerificationHandler(req: Request, res: Response) {
  const carte = await verificationService.getCarteVerification(req.params.professionnelId);
  return ok(res, carte);
}
