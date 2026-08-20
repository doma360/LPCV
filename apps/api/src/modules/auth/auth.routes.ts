import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "@/utils/asyncHandler.js";
import {
  loginHandler,
  motDePasseOublieHandler,
  refreshHandler,
  registerHandler,
  reinitialiserMotDePasseHandler,
} from "./auth.controller.js";

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
authRouter.post("/mot-de-passe-oublie", authLimiter, asyncHandler(motDePasseOublieHandler));
authRouter.post("/reinitialiser-mot-de-passe", authLimiter, asyncHandler(reinitialiserMotDePasseHandler));
