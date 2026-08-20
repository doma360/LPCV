import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { registerDeviceHandler, removeDeviceHandler } from "./devices.controller.js";

export const devicesRouter = Router();

devicesRouter.use(requireAuth);
devicesRouter.post("/", asyncHandler(registerDeviceHandler));
devicesRouter.delete("/:id", asyncHandler(removeDeviceHandler));
