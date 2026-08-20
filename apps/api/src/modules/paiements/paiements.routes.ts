import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { confirmerEspecesHandler, createHandler, getHandler } from "./paiements.controller.js";

const paiementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const paiementsRouter = Router();

paiementsRouter.use(requireAuth);
paiementsRouter.post("/", paiementLimiter, asyncHandler(createHandler));
paiementsRouter.get("/:id", asyncHandler(getHandler));
paiementsRouter.post("/:id/confirmer-especes", asyncHandler(confirmerEspecesHandler));
