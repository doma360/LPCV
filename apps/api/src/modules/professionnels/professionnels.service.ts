import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import { getParametreNombre } from "@/lib/parametres.js";
import { calculerPrixEstime } from "@/lib/tarification.js";
import type {
  CreateDisponibiliteInput,
  MatchProfessionnelsInput,
  SearchProfessionnelsInput,
  UpdateProfessionnelInput,
} from "./professionnels.schema.js";

const sortColumn = {
  distance: Prisma.sql`distance_km ASC`,
  prix: Prisma.sql`tarif_indicatif_min ASC NULLS LAST`,
  note: Prisma.sql`note_moyenne DESC`,
};

interface ProResult {
  id: string;
  nom: string;
  prenom: string;
  photoUrl: string | null;
  presentation: string | null;
  tarifIndicatifMin: Prisma.Decimal | null;
  tarifIndicatifMax: Prisma.Decimal | null;
  noteMoyenne: Prisma.Decimal;
  nombreAvis: number;
  professionNom: string;
  professionSlug: string;
  distanceKm: number | null;
}

// Distance calculée en SQL (Haversine) plutôt qu'en PostGIS ou Distance Matrix,
// voir docs/decisions.md pour le raisonnement.
function queryNearby(lat: number, lng: number, rayonKm: number, whereClause: Prisma.Sql, orderBy: Prisma.Sql, limit: number, skip: number) {
  return prisma.$queryRaw<ProResult[]>`
    WITH nearby_zones AS (
      SELECT
        id,
        6371 * acos(
          LEAST(1.0, cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng}))
          + sin(radians(${lat})) * sin(radians(latitude)))
        ) AS distance_km
      FROM zone_intervention
      WHERE actif = true
    ),
    pro_distances AS (
      SELECT pz.id_professionnel, MIN(nz.distance_km) AS distance_km
      FROM professionnel_zone pz
      JOIN nearby_zones nz ON nz.id = pz.id_zone
      WHERE nz.distance_km <= ${rayonKm}
      GROUP BY pz.id_professionnel
    )
    SELECT
      p.id, p.nom, p.prenom, p.photo_url as "photoUrl", p.presentation,
      p.tarif_indicatif_min as "tarifIndicatifMin", p.tarif_indicatif_max as "tarifIndicatifMax",
      p.note_moyenne as "noteMoyenne", p.nombre_avis as "nombreAvis",
      prof.nom as "professionNom", prof.slug as "professionSlug",
      pd.distance_km as "distanceKm"
    FROM professionnel p
    JOIN pro_distances pd ON pd.id_professionnel = p.id
    JOIN profession prof ON prof.id = p.id_profession
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${skip}
  `;
}

export async function searchProfessionnels(input: SearchProfessionnelsInput) {
  const skip = (input.page - 1) * input.limit;

  const filters = [Prisma.sql`p.statut_verification = 'verifie'`, Prisma.sql`p.statut = 'actif'`];
  if (input.metier) filters.push(Prisma.sql`prof.slug = ${input.metier}`);
  if (input.prixMax) filters.push(Prisma.sql`p.tarif_indicatif_min <= ${input.prixMax}`);
  if (input.noteMin) filters.push(Prisma.sql`p.note_moyenne >= ${input.noteMin}`);
  const whereClause = Prisma.join(filters, " AND ");

  if (input.lat === undefined || input.lng === undefined) {
    const rows = await prisma.$queryRaw<ProResult[]>`
      SELECT
        p.id, p.nom, p.prenom, p.photo_url as "photoUrl", p.presentation,
        p.tarif_indicatif_min as "tarifIndicatifMin", p.tarif_indicatif_max as "tarifIndicatifMax",
        p.note_moyenne as "noteMoyenne", p.nombre_avis as "nombreAvis",
        prof.nom as "professionNom", prof.slug as "professionSlug",
        NULL as "distanceKm"
      FROM professionnel p
      JOIN profession prof ON prof.id = p.id_profession
      WHERE ${whereClause}
      ORDER BY ${input.tri === "prix" ? sortColumn.prix : sortColumn.note}
      LIMIT ${input.limit} OFFSET ${skip}
    `;
    return { results: rows, page: input.page, limit: input.limit };
  }

  const rows = await queryNearby(input.lat, input.lng, input.rayonKm, whereClause, sortColumn[input.tri], input.limit, skip);
  return { results: rows, page: input.page, limit: input.limit };
}

// Prestataire disponible le plus proche : élargit progressivement le rayon tant
// qu'on n'a pas assez de candidats, filtre sur la disponibilité de l'instant,
// et calcule un prix estimé (tarif de base du pro + distance × tarif au km).
const JOURS: Record<number, string> = {
  0: "DIMANCHE",
  1: "LUNDI",
  2: "MARDI",
  3: "MERCREDI",
  4: "JEUDI",
  5: "VENDREDI",
  6: "SAMEDI",
};

function estDisponibleMaintenant(disponibilites: { jour: string; heureDebut: string; heureFin: string }[]) {
  const maintenant = new Date();
  const jour = JOURS[maintenant.getDay()];
  const heure = maintenant.toTimeString().slice(0, 5); // "HH:mm"
  return disponibilites.some((d) => d.jour === jour && d.heureDebut <= heure && heure <= d.heureFin);
}

const NOTE_WEIGHT_KM = 0.3; // chaque point de note "rapproche" le pro d'autant de km dans le classement

export async function matchProfessionnels(input: MatchProfessionnelsInput) {
  const [tarifParKm, rayonInitial, rayonMax] = await Promise.all([
    getParametreNombre("tarif_par_km", 300),
    getParametreNombre("rayon_recherche_initial_km", 5),
    getParametreNombre("rayon_recherche_max_km", 40),
  ]);

  const whereClause = Prisma.join(
    [Prisma.sql`p.statut_verification = 'verifie'`, Prisma.sql`p.statut = 'actif'`, Prisma.sql`prof.slug = ${input.metier}`],
    " AND ",
  );

  let rayon = rayonInitial;
  let candidats: ProResult[] = [];
  while (true) {
    candidats = await queryNearby(input.lat, input.lng, rayon, whereClause, sortColumn.distance, 50, 0);
    if (candidats.length >= input.limit || rayon >= rayonMax) break;
    rayon = Math.min(rayon * 2, rayonMax);
  }

  const disponibilites = await prisma.disponibilite.findMany({
    where: { professionnelId: { in: candidats.map((c) => c.id) }, actif: true },
  });
  const disponibilitesParPro = new Map<string, typeof disponibilites>();
  for (const d of disponibilites) {
    disponibilitesParPro.set(d.professionnelId, [...(disponibilitesParPro.get(d.professionnelId) ?? []), d]);
  }

  const classes = candidats
    .filter((c) => estDisponibleMaintenant(disponibilitesParPro.get(c.id) ?? []))
    .map((c) => {
      const base = Number(c.tarifIndicatifMin ?? 0);
      const distanceKm = c.distanceKm ?? 0;
      const prixEstime = calculerPrixEstime(base, distanceKm, tarifParKm);
      const score = distanceKm - Number(c.noteMoyenne) * NOTE_WEIGHT_KM;
      return { ...c, prixEstime, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, input.limit)
    .map(({ score: _score, ...rest }) => rest);

  return { candidats: classes, rayonUtiliseKm: rayon };
}

// Distance entre un point et la zone la plus proche couverte par un professionnel donné —
// utilisé pour figer le prix estimé au moment où une demande ciblée est créée.
export async function distanceToProfessionnel(professionnelId: string, lat: number, lng: number) {
  const rows = await prisma.$queryRaw<{ distanceKm: number }[]>`
    SELECT MIN(
      6371 * acos(
        LEAST(1.0, cos(radians(${lat})) * cos(radians(z.latitude)) * cos(radians(z.longitude) - radians(${lng}))
        + sin(radians(${lat})) * sin(radians(z.latitude)))
      )
    ) as "distanceKm"
    FROM professionnel_zone pz
    JOIN zone_intervention z ON z.id = pz.id_zone
    WHERE pz.id_professionnel = ${professionnelId} AND z.actif = true
  `;
  return rows[0]?.distanceKm ?? null;
}

export async function getProfessionnel(id: string) {
  const professionnel = await prisma.professionnel.findFirst({
    where: { id, statut: "ACTIF" },
    include: {
      profession: true,
      zones: { include: { zone: true } },
      disponibilites: { where: { actif: true } },
    },
  });
  if (!professionnel) throw Errors.notFound("Professionnel introuvable");
  const { motDePasseHash: _motDePasseHash, ...rest } = professionnel;
  return rest;
}

export async function updateProfessionnel(id: string, input: UpdateProfessionnelInput) {
  const { zoneIds, ...fields } = input;

  return prisma.professionnel.update({
    where: { id },
    data: {
      ...fields,
      ...(zoneIds && {
        zones: {
          deleteMany: {},
          create: zoneIds.map((zoneId) => ({ zoneId })),
        },
      }),
    },
    include: { profession: true, zones: { include: { zone: true } } },
  });
}

export function listDisponibilites(professionnelId: string) {
  return prisma.disponibilite.findMany({
    where: { professionnelId, actif: true },
    orderBy: [{ jour: "asc" }, { heureDebut: "asc" }],
  });
}

export function createDisponibilite(professionnelId: string, input: CreateDisponibiliteInput) {
  if (input.heureDebut >= input.heureFin) {
    throw Errors.badRequest("L'heure de début doit précéder l'heure de fin");
  }
  return prisma.disponibilite.create({ data: { professionnelId, ...input } });
}

export async function deleteDisponibilite(id: string, professionnelId: string) {
  const dispo = await prisma.disponibilite.findUnique({ where: { id } });
  if (!dispo) throw Errors.notFound("Créneau introuvable");
  if (dispo.professionnelId !== professionnelId) throw Errors.forbidden();
  await prisma.disponibilite.delete({ where: { id } });
}

const PORTFOLIO_MAX = 12;

export async function ajouterPhotoPortfolio(professionnelId: string, url: string) {
  const professionnel = await prisma.professionnel.findUniqueOrThrow({ where: { id: professionnelId } }).catch(() => {
    throw Errors.notFound();
  });
  if (professionnel.portfolioUrls.length >= PORTFOLIO_MAX) {
    throw Errors.badRequest(`Maximum ${PORTFOLIO_MAX} photos dans le portfolio`);
  }
  return prisma.professionnel.update({
    where: { id: professionnelId },
    data: { portfolioUrls: { push: url } },
    select: { portfolioUrls: true },
  });
}

export async function retirerPhotoPortfolio(professionnelId: string, url: string) {
  const professionnel = await prisma.professionnel.findUniqueOrThrow({ where: { id: professionnelId } }).catch(() => {
    throw Errors.notFound();
  });
  return prisma.professionnel.update({
    where: { id: professionnelId },
    data: { portfolioUrls: professionnel.portfolioUrls.filter((u) => u !== url) },
    select: { portfolioUrls: true },
  });
}

export async function getRevenus(professionnelId: string) {
  const paiements = await prisma.paiement.findMany({
    where: { statut: "CONFIRME", demande: { professionnelId } },
    orderBy: { dateConfirmation: "desc" },
    take: 20,
    select: { id: true, montantNet: true, dateConfirmation: true, demande: { select: { profession: { select: { nom: true } } } } },
  });

  const total = await prisma.paiement.aggregate({
    where: { statut: "CONFIRME", demande: { professionnelId } },
    _sum: { montantNet: true },
    _count: true,
  });

  return {
    totalGagne: total._sum.montantNet ?? 0,
    nombrePaiements: total._count,
    paiementsRecents: paiements,
  };
}
