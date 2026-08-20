import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET est requis"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET est requis"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  CORS_ORIGINS: z.string().default(""),
  TELEPHONIE_PROVIDER: z.enum(["mock", "twilio", "africastalking"]).default("mock"),
  PAIEMENT_PROVIDER: z.enum(["mock", "cinetpay", "paydunya"]).default("mock"),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  NOTIFICATION_PROVIDER: z.enum(["mock", "twilio", "sendgrid"]).default("mock"),
  // Sert à construire les URLs absolues des fichiers uploadés (provider local
  // uniquement) — doit être l'adresse à laquelle l'app mobile joint l'API.
  API_PUBLIC_URL: z.string().default("http://localhost:4000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuration invalide :", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
