export interface ResultatInitiation {
  reference: string;
  confirmeImmediatement: boolean;
}

// Un provider sait faire une seule chose : demander à l'agrégateur (CinetPay,
// PayDunya...) de prélever un montant via mobile money, et renvoyer une référence
// de transaction. La confirmation réelle arrive normalement par webhook — le mock
// simule un succès immédiat, comme un environnement sandbox.
export interface PaiementProvider {
  initierPaiement(montant: number, methode: string): Promise<ResultatInitiation>;
}
