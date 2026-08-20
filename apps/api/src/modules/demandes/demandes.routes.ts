import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import {
  createHandler,
  getHandler,
  lancerAppelHandler,
  listHandler,
  updatePositionHandler,
  updateStatutHandler,
} from "./demandes.controller.js";

const appelLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const demandesRouter = Router();

demandesRouter.use(requireAuth);
demandesRouter.get("/", asyncHandler(listHandler));
demandesRouter.post("/", asyncHandler(createHandler));
demandesRouter.get("/:id", asyncHandler(getHandler));
demandesRouter.patch("/:id/statut", asyncHandler(updateStatutHandler));
demandesRouter.post("/:id/appel", appelLimiter, asyncHandler(lancerAppelHandler));
demandesRouter.patch("/:id/position", asyncHandler(updatePositionHandler));
