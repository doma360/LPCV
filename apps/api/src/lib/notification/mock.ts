import type { NotificationProvider } from "./types.js";

// N'envoie rien réellement — sert à développer/tester le flux de
// réinitialisation sans compte chez un prestataire SMS/email (voir
// docs/deploiement.md). Le code apparaît dans les logs du serveur.
export class MockNotificationProvider implements NotificationProvider {
  async envoyerCode(destinataire: string, code: string): Promise<void> {
    console.log(`[notification:mock] code de réinitialisation pour ${destinataire} : ${code}`);
  }
}
