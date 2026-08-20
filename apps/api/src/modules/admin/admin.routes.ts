import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { decideVerificationHandler, listPendingHandler, statsHandler } from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("administrateur"));
adminRouter.get("/stats", asyncHandler(statsHandler));
adminRouter.get("/professionnels/en-attente", asyncHandler(listPendingHandler));
adminRouter.patch("/verifications/:id", asyncHandler(decideVerificationHandler));
