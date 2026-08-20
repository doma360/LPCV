import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth.js";
import { notImplemented } from "@/utils/notImplemented.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("administrateur"));
adminRouter.get("/stats", notImplemented);
adminRouter.patch("/verifications/:id", notImplemented);
