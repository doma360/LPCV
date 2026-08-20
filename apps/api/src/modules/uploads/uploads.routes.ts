import { Router } from "express";
import multer from "multer";
import { requireAuth } from "@/middleware/auth.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { uploadPhotoHandler } from "./uploads.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Seules les images sont acceptées"));
    cb(null, true);
  },
});

export const uploadsRouter = Router();

uploadsRouter.post("/photo", requireAuth, upload.single("fichier"), asyncHandler(uploadPhotoHandler));
