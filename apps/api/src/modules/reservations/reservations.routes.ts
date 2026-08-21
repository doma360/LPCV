import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import {
  annulerHandler,
  confirmerHandler,
  createHandler,
  getHandler,
  lancerAppelHandler,
  listHandler,
  listMessagesHandler,
  envoyerMessageHandler,
  payerHandler,
  refuserHandler,
  terminerHandler,
} from "./reservations.controller.js";

const appelLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const reservationsRouter = Router();

reservationsRouter.use(requireAuth);
reservationsRouter.get("/", asyncHandler(listHandler));
reservationsRouter.post("/", asyncHandler(createHandler));
reservationsRouter.get("/:id", asyncHandler(getHandler));
reservationsRouter.patch("/:id/confirmer", asyncHandler(confirmerHandler));
reservationsRouter.patch("/:id/refuser", asyncHandler(refuserHandler));
reservationsRouter.patch("/:id/terminer", asyncHandler(terminerHandler));
reservationsRouter.patch("/:id/annuler", asyncHandler(annulerHandler));
reservationsRouter.post("/:id/payer", asyncHandler(payerHandler));
reservationsRouter.get("/:id/messages", asyncHandler(listMessagesHandler));
reservationsRouter.post("/:id/messages", asyncHandler(envoyerMessageHandler));
reservationsRouter.post("/:id/appel", appelLimiter, asyncHandler(lancerAppelHandler));
