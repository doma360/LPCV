import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { Logger } from "pino";
import { corsOrigins } from "@/config/env.js";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler.js";
import { authRouter } from "@/modules/auth/auth.routes.js";
import { usersRouter } from "@/modules/users/users.routes.js";
import { professionnelsRouter } from "@/modules/professionnels/professionnels.routes.js";
import { demandesRouter } from "@/modules/demandes/demandes.routes.js";
import { avisRouter } from "@/modules/avis/avis.routes.js";
import { paiementsRouter } from "@/modules/paiements/paiements.routes.js";
import { messagesRouter } from "@/modules/messages/messages.routes.js";
import { devicesRouter } from "@/modules/devices/devices.routes.js";
import { vitrineRouter } from "@/modules/vitrine/vitrine.routes.js";
import { adminRouter } from "@/modules/admin/admin.routes.js";
import { uploadsRouter } from "@/modules/uploads/uploads.routes.js";
import { abonnementsRouter } from "@/modules/abonnements/abonnements.routes.js";
import { verificationRouter } from "@/modules/verification/verification.routes.js";

export function createApp(logger: Logger) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      // Le mobile n'est pas soumis à CORS (Volume 8 §9) ; seuls vitrine/back-office sont restreints ici.
      origin: corsOrigins.length > 0 ? corsOrigins : true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" }, message: "OK" }));

  // Provider local uniquement (voir src/lib/storage) — images servies publiquement,
  // cross-origin-resource-policy relâché pour que l'app mobile puisse les afficher.
  app.use(
    "/uploads",
    express.static(path.resolve(process.cwd(), "uploads"), {
      setHeaders: (res) => res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
    }),
  );

  const v1 = express.Router();
  v1.use("/auth", authRouter);
  v1.use("/users", usersRouter);
  v1.use("/professionnels", professionnelsRouter);
  v1.use("/demandes", demandesRouter);
  v1.use("/avis", avisRouter);
  v1.use("/paiements", paiementsRouter);
  v1.use("/messages", messagesRouter);
  v1.use("/devices", devicesRouter);
  v1.use("/vitrine", vitrineRouter);
  v1.use("/admin", adminRouter);
  v1.use("/uploads", uploadsRouter);
  v1.use("/abonnements", abonnementsRouter);
  v1.use("/verification", verificationRouter);
  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return app;
}
