import type { Request, Response } from "express";
import { created } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { getStorageProvider } from "@/lib/storage/index.js";

export async function uploadPhotoHandler(req: Request, res: Response) {
  if (!req.file) throw Errors.badRequest("Aucun fichier reçu");

  const provider = getStorageProvider();
  const { url } = await provider.enregistrer(req.file.buffer, req.file.originalname, req.file.mimetype);
  return created(res, { url }, "Fichier envoyé");
}
