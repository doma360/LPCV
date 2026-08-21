import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { getCarteVerificationHandler } from "./verification.controller.js";

// Public, sans auth : consulte via le QR code de la carte membre.
export const verificationRouter = Router();
verificationRouter.get("/:professionnelId", asyncHandler(getCarteVerificationHandler));
