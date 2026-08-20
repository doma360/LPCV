import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { loginHandler, refreshHandler, registerHandler } from "./auth.controller.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.post("/register", authLimiter, asyncHandler(registerHandler));
authRouter.post("/login", authLimiter, asyncHandler(loginHandler));
authRouter.post("/refresh", asyncHandler(refreshHandler));
