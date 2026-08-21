// Catalogue des clés ParametrePlateforme editables depuis l'admin. Le stockage
// (apps/api/src/lib/parametres.ts) est un simple key-value sans typage : ce
// catalogue sert de source de verite pour les libelles/types/valeurs par
// defaut affiches et valides cote admin.
export interface DefinitionParametre {
  cle: string;
  label: string;
  description: string;
  type: "nombre" | "texte";
  groupe: "tarification" | "abonnements" | "legal";
  defaut: string;
}

export const CATALOGUE_PARAMETRES: DefinitionParametre[] = [
  {
    cle: "tarif_par_km",
    label: "Tarif par km",
    description: "FCFA facturés par kilomètre pour l'estimation de prix d'une demande.",
    type: "nombre",
    groupe: "tarification",
    defaut: "300",
  },
  {
    cle: "rayon_recherche_initial_km",
    label: "Rayon de recherche initial",
    description: "Rayon (km) utilisé au premier essai pour trouver un professionnel disponible.",
    type: "nombre",
    groupe: "tarification",
    defaut: "5",
  },
  {
    cle: "rayon_recherche_max_km",
    label: "Rayon de recherche maximum",
    description: "Rayon (km) au-delà duquel la recherche s'arrête si aucun professionnel n'est trouvé.",
    type: "nombre",
    groupe: "tarification",
    defaut: "40",
  },
  {
    cle: "taux_commission",
    label: "Taux de commission",
    description: "Part (entre 0 et 1) prélevée par LPCV sur chaque paiement, ex. 0.15 = 15%.",
    type: "nombre",
    groupe: "tarification",
    defaut: "0.15",
  },
  {
    cle: "abonnement_mensuel_fcfa",
    label: "Abonnement mensuel",
    description: "Prix en FCFA de l'abonnement professionnel mensuel.",
    type: "nombre",
    groupe: "abonnements",
    defaut: "5000",
  },
  {
    cle: "abonnement_annuel_fcfa",
    label: "Abonnement annuel",
    description: "Prix en FCFA de l'abonnement professionnel annuel.",
    type: "nombre",
    groupe: "abonnements",
    defaut: "40000",
  },
  {
    cle: "cgu_texte",
    label: "Conditions générales d'utilisation",
    description: "Texte affiché aux utilisateurs lors de l'inscription.",
    type: "texte",
    groupe: "legal",
    defaut: "",
  },
  {
    cle: "politique_confidentialite_texte",
    label: "Politique de confidentialité",
    description: "Texte affiché aux utilisateurs concernant l'usage de leurs données.",
    type: "texte",
    groupe: "legal",
    defaut: "",
  },
];

export const CLES_CONNUES = new Set(CATALOGUE_PARAMETRES.map((p) => p.cle));
