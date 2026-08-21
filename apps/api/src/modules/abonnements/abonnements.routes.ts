import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getMonAbonnementHandler } from "./abonnements.controller.js";

export const abonnementsRouter = Router();

abonnementsRouter.get("/moi", requireAuth, asyncHandler(getMonAbonnementHandler));
