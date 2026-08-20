export interface FichierEnregistre {
  url: string;
}

// Volume 4 §10 du LPD : les médias sont hébergés en externe, jamais dans le
// dépôt de code. Le provider local est un repli de développement uniquement.
export interface StorageProvider {
  enregistrer(buffer: Buffer, nomFichier: string, mimeType: string): Promise<FichierEnregistre>;
}
