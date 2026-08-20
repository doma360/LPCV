// Un provider sait envoyer un message court à un destinataire (email ou
// téléphone) — utilisé pour les codes de réinitialisation de mot de passe.
export interface NotificationProvider {
  envoyerCode(destinataire: string, code: string): Promise<void>;
}
