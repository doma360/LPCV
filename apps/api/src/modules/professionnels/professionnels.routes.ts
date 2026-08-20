import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import {
  ajouterPhotoPortfolioHandler,
  createDisponibiliteHandler,
  deleteDisponibiliteHandler,
  getHandler,
  listDisponibilitesHandler,
  matchHandler,
  retirerPhotoPortfolioHandler,
  revenusHandler,
  searchHandler,
  updateHandler,
} from "./professionnels.controller.js";

export const professionnelsRouter = Router();

professionnelsRouter.get("/", asyncHandler(searchHandler));
professionnelsRouter.get("/matching", asyncHandler(matchHandler));
professionnelsRouter.get("/disponibilites", requireAuth, asyncHandler(listDisponibilitesHandler));
professionnelsRouter.post("/disponibilites", requireAuth, asyncHandler(createDisponibiliteHandler));
professionnelsRouter.delete("/disponibilites/:id", requireAuth, asyncHandler(deleteDisponibiliteHandler));
professionnelsRouter.get("/revenus", requireAuth, asyncHandler(revenusHandler));
professionnelsRouter.post("/portfolio", requireAuth, asyncHandler(ajouterPhotoPortfolioHandler));
professionnelsRouter.delete("/portfolio", requireAuth, asyncHandler(retirerPhotoPortfolioHandler));
professionnelsRouter.get("/:id", asyncHandler(getHandler));
professionnelsRouter.patch("/:id", requireAuth, asyncHandler(updateHandler));
