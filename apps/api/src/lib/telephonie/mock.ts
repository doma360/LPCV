import { randomUUID } from "node:crypto";
import type { ResultatAppel, TelephonieProvider } from "./types.js";

// Ne passe aucun vrai appel — sert à développer/tester le flux sans compte
// chez un prestataire de téléphonie (Twilio, Africa's Talking...).
export class MockTelephonieProvider implements TelephonieProvider {
  async lancerAppel(numeroA: string, numeroB: string): Promise<ResultatAppel> {
    const providerAppelId = `mock_${randomUUID()}`;
    console.log(`[téléphonie:mock] pont d'appel simulé ${numeroA} <-> ${numeroB} (id ${providerAppelId})`);
    return { providerAppelId };
  }
}
