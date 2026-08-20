import { env } from "@/config/env.js";
import { MockPaiementProvider } from "./mock.js";
import type { PaiementProvider } from "./types.js";

export type { PaiementProvider } from "./types.js";

// Même logique que src/lib/telephonie : un seul point de branchement pour
// ajouter CinetPay/PayDunya quand le compte marchand sera prêt
// (voir docs/deploiement.md).
export function getPaiementProvider(): PaiementProvider {
  switch (env.PAIEMENT_PROVIDER) {
    case "mock":
    default:
      return new MockPaiementProvider();
  }
}
