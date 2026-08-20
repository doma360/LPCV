import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { createHandler, listForProfessionnelHandler, signalerHandler } from "./avis.controller.js";

export const avisRouter = Router();

// POST / — un avis uniquement après une demande "terminee" (règle métier Volume 2 §7)
avisRouter.post("/", requireAuth, asyncHandler(createHandler));
avisRouter.get("/professionnel/:id", asyncHandler(listForProfessionnelHandler));
avisRouter.post("/:id/signaler", requireAuth, asyncHandler(signalerHandler));
