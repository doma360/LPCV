import { env } from "@/config/env.js";
import { MockTelephonieProvider } from "./mock.js";
import type { TelephonieProvider } from "./types.js";

export type { TelephonieProvider } from "./types.js";

// Un seul point de branchement : ajouter un fichier twilio.ts / africastalking.ts
// qui implémente TelephonieProvider, puis l'ajouter ici. Rien d'autre à changer
// dans le reste du code (voir docs/deploiement.md pour la clé API correspondante).
export function getTelephonieProvider(): TelephonieProvider {
  switch (env.TELEPHONIE_PROVIDER) {
    case "mock":
    default:
      return new MockTelephonieProvider();
  }
}
