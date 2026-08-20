import { env } from "@/config/env.js";
import { MockNotificationProvider } from "./mock.js";
import type { NotificationProvider } from "./types.js";

export type { NotificationProvider } from "./types.js";

// Un seul point de branchement : ajouter un fichier twilio.ts / sendgrid.ts
// qui implémente NotificationProvider, puis l'ajouter ici.
export function getNotificationProvider(): NotificationProvider {
  switch (env.NOTIFICATION_PROVIDER) {
    case "mock":
    default:
      return new MockNotificationProvider();
  }
}
