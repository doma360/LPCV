import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import {
  accorderAbonnementHandler,
  changerStatutUtilisateurHandler,
  decideVerificationHandler,
  listAvisSignalesHandler,
  listParametresHandler,
  listPendingHandler,
  listUtilisateursHandler,
  modererAvisHandler,
  statsHandler,
  updateParametresHandler,
} from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("administrateur"));
adminRouter.get("/stats", asyncHandler(statsHandler));
adminRouter.get("/professionnels/en-attente", asyncHandler(listPendingHandler));
adminRouter.patch("/verifications/:id", asyncHandler(decideVerificationHandler));
adminRouter.get("/avis-signales", asyncHandler(listAvisSignalesHandler));
adminRouter.patch("/avis-signales/:id", asyncHandler(modererAvisHandler));
adminRouter.get("/utilisateurs", asyncHandler(listUtilisateursHandler));
adminRouter.patch("/utilisateurs/:type/:id/statut", asyncHandler(changerStatutUtilisateurHandler));
adminRouter.post("/abonnements/:id", asyncHandler(accorderAbonnementHandler));
adminRouter.get("/parametres", asyncHandler(listParametresHandler));
adminRouter.patch("/parametres", asyncHandler(updateParametresHandler));
