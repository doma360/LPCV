// Nouvelle identité de marque (voir docs/decisions.md) : bleu nuit/bleu clair/
// jaune, versions vives, fond blanc. À reporter aussi sur apps/website/src/index.css
// et apps/admin/src/index.css (échelle de teintes complète à générer séparément —
// pas fait dans cette passe, voir le journal de décisions).
export const colors = {
  brand900: "#172242", // Bleu Nuit — couleur de marque principale (remplace le vert foncé)
  brand700: "#2b3f66", // teinte intermédiaire dérivée, usages secondaires
  brand100: "#d7e3f5",
  brand50: "#eef3fc",

  bleuClair: "#5DAEF7", // Bleu Clair — nouvel accent secondaire du moodboard

  accent500: "#FFC107", // Jaune Chaud — accent plus soutenu
  accent400: "#FDE235", // Jaune Soleil — couleur d'action principale (vif)
  accent300: "#FFF3B0",
  accent700: "#8a5d00", // texte lisible sur fond jaune, inchangé

  orange500: "#FF7A00", // Orange Énergie — touche parcimonieuse

  success500: "#16a34a",
  danger500: "#dc2626",

  ink900: "#111721", // Noir Profond
  ink700: "#374151",
  ink500: "#6b7280",
  ink400: "#9ca3af",
  ink200: "#e5e7eb",
  ink100: "#f3f4f6",

  cream100: "#ffffff", // fond blanc demandé — l'app est un vrai produit à livrer, pas un moodboard
  white: "#ffffff",
};
