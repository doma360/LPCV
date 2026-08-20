import { randomUUID } from "node:crypto";
import type { PaiementProvider, ResultatInitiation } from "./types.js";

// Ne débite jamais rien de réel — simule un agrégateur en sandbox qui confirme
// systématiquement, pour développer/tester le flux sans compte CinetPay/PayDunya.
export class MockPaiementProvider implements PaiementProvider {
  async initierPaiement(montant: number, methode: string): Promise<ResultatInitiation> {
    const reference = `mock_${randomUUID()}`;
    console.log(`[paiement:mock] ${montant} FCFA via ${methode} confirmé (réf ${reference})`);
    return { reference, confirmeImmediatement: true };
  }
}
