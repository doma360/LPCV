// Repli manuel si le GPS est refusé — mêmes zones que apps/api/prisma/seed.ts.
// À terme, remplacé par un vrai pin-sur-carte + géocodage inverse (voir docs/deploiement.md).
export const zones = [
  { nom: "Cocody", latitude: 5.3599, longitude: -3.9812 },
  { nom: "Marcory", latitude: 5.2926, longitude: -3.9878 },
  { nom: "Yopougon", latitude: 5.3453, longitude: -4.0658 },
  { nom: "Plateau", latitude: 5.3197, longitude: -4.0244 },
  { nom: "Angré", latitude: 5.3844, longitude: -3.9662 },
  { nom: "Bingerville", latitude: 5.3556, longitude: -3.8825 },
];
