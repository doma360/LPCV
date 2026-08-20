import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const professions = [
  { nom: "Maison & Bâtiment", slug: "maison-batiment", description: "Maçonnerie, menuiserie, peinture, rénovation", iconeSlug: "maison" },
  { nom: "Plomberie", slug: "plomberie", description: "Fuites, installations, dépannage sanitaire", iconeSlug: "plomberie" },
  { nom: "Électricité", slug: "electricite", description: "Installation, panne, mise aux normes", iconeSlug: "electricite" },
  { nom: "Ménage", slug: "menage", description: "Entretien et nettoyage à domicile", iconeSlug: "menage" },
  { nom: "Informatique", slug: "informatique", description: "Dépannage, réseau, installation", iconeSlug: "informatique" },
  { nom: "Transport", slug: "transport", description: "Déménagement et livraison", iconeSlug: "transport" },
];

const zones = [
  { nom: "Cocody", commune: "Cocody", latitude: 5.3599, longitude: -3.9812 },
  { nom: "Marcory", commune: "Marcory", latitude: 5.2926, longitude: -3.9878 },
  { nom: "Yopougon", commune: "Yopougon", latitude: 5.3453, longitude: -4.0658 },
  { nom: "Plateau", commune: "Plateau", latitude: 5.3197, longitude: -4.0244 },
  { nom: "Angré", commune: "Cocody", latitude: 5.3844, longitude: -3.9662 },
  { nom: "Bingerville", commune: "Bingerville", latitude: 5.3556, longitude: -3.8825 },
];

const parametres = [
  { cle: "tarif_par_km", valeur: "300" },
  { cle: "rayon_recherche_initial_km", valeur: "5" },
  { cle: "rayon_recherche_max_km", valeur: "40" },
  { cle: "taux_commission", valeur: "0.15" },
];

async function main() {
  for (const parametre of parametres) {
    await prisma.parametrePlateforme.upsert({
      where: { cle: parametre.cle },
      create: parametre,
      update: {},
    });
  }

  for (const profession of professions) {
    await prisma.profession.upsert({
      where: { slug: profession.slug },
      create: profession,
      update: profession,
    });
  }

  for (const zone of zones) {
    const existing = await prisma.zoneIntervention.findFirst({ where: { nom: zone.nom } });
    if (!existing) await prisma.zoneIntervention.create({ data: zone });
  }

  const adminEmail = "admin@lpcv.local";
  const existingAdmin = await prisma.administrateur.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.administrateur.create({
      data: {
        nom: "Admin",
        prenom: "LPCV",
        email: adminEmail,
        motDePasseHash: await bcrypt.hash("changeme123", 12),
        role: "SUPERVISION",
      },
    });
    console.log(`Administrateur créé : ${adminEmail} / changeme123 (à changer immédiatement)`);
  }

  console.log("Seed terminé.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
