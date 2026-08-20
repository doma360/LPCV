// Tarif = base (déclarée par le professionnel) + distance × tarif au km (paramètre plateforme).
// Toujours calculé côté serveur — jamais accepté depuis le client.
export function calculerPrixEstime(tarifBase: number, distanceKm: number, tarifParKm: number) {
  return Math.round(tarifBase + distanceKm * tarifParKm);
}
