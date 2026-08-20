import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getMeHandler, updateMeHandler } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.get("/me", asyncHandler(getMeHandler));
usersRouter.patch("/me", asyncHandler(updateMeHandler));
