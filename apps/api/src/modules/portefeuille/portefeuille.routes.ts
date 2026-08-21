import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { demanderRetraitHandler, getMonPortefeuilleHandler } from "./portefeuille.controller.js";

export const portefeuilleRouter = Router();

portefeuilleRouter.use(requireAuth);
portefeuilleRouter.get("/moi", asyncHandler(getMonPortefeuilleHandler));
portefeuilleRouter.post("/retrait", asyncHandler(demanderRetraitHandler));
