import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getHandler, matchHandler, searchHandler, updateHandler } from "./professionnels.controller.js";

export const professionnelsRouter = Router();

professionnelsRouter.get("/", asyncHandler(searchHandler));
professionnelsRouter.get("/matching", asyncHandler(matchHandler));
professionnelsRouter.get("/:id", asyncHandler(getHandler));
professionnelsRouter.patch("/:id", requireAuth, asyncHandler(updateHandler));
