import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { notImplemented } from "@/utils/notImplemented.js";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);
messagesRouter.get("/demande/:id", notImplemented);
messagesRouter.post("/", notImplemented);
