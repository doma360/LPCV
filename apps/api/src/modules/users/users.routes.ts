import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { changerMotDePasseHandler, desactiverCompteHandler, getMeHandler, updateMeHandler } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.get("/me", asyncHandler(getMeHandler));
usersRouter.patch("/me", asyncHandler(updateMeHandler));
usersRouter.patch("/me/mot-de-passe", asyncHandler(changerMotDePasseHandler));
usersRouter.delete("/me", asyncHandler(desactiverCompteHandler));
