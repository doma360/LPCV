export interface ResultatAppel {
  providerAppelId: string;
}

// Un provider sait faire une seule chose : appeler A, puis quand ça décroche,
// appeler B et connecter les deux lignes. Ni A ni B ne voit le numéro de l'autre.
export interface TelephonieProvider {
  lancerAppel(numeroA: string, numeroB: string): Promise<ResultatAppel>;
}
