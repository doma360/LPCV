import pino from "pino";
import { env } from "@/config/env.js";
import { createApp } from "@/app.js";
import { prisma } from "@/lib/prisma.js";

const logger = pino({ level: env.NODE_ENV === "production" ? "info" : "debug" });
const app = createApp(logger);

const server = app.listen(env.PORT, () => {
  logger.info(`API LPCV démarrée sur http://localhost:${env.PORT}`);
});

async function shutdown() {
  logger.info("Arrêt en cours...");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
