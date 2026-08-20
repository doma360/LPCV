import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/config/env.js";
import type { FichierEnregistre, StorageProvider } from "./types.js";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Écrit sur le disque local et sert via /uploads (voir app.ts). Uniquement
// pour le développement — à remplacer par S3/R2 avant la mise en production
// (voir docs/deploiement.md), sans changer le reste du code.
export class LocalStorageProvider implements StorageProvider {
  async enregistrer(buffer: Buffer, nomFichier: string, _mimeType: string): Promise<FichierEnregistre> {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const extension = path.extname(nomFichier) || ".jpg";
    const nomUnique = `${randomUUID()}${extension}`;
    await writeFile(path.join(UPLOADS_DIR, nomUnique), buffer);
    return { url: `${env.API_PUBLIC_URL}/uploads/${nomUnique}` };
  }
}
