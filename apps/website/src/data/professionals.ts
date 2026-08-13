export interface Professional {
  id: string;
  name: string;
  profession: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  priceFrom: number;
  priceTo: number;
  verified: boolean;
  available: boolean;
  zone: string;
}

export const professionals: Professional[] = [
  {
    id: "1",
    name: "Koffi Services",
    profession: "Plombier",
    distanceKm: 0.8,
    rating: 4.9,
    reviews: 128,
    priceFrom: 2500,
    priceTo: 4000,
    verified: true,
    available: true,
    zone: "Cocody",
  },
  {
    id: "2",
    name: "Électricité Yao",
    profession: "Électricien",
    distanceKm: 1.4,
    rating: 4.8,
    reviews: 96,
    priceFrom: 3000,
    priceTo: 5000,
    verified: true,
    available: true,
    zone: "Marcory",
  },
  {
    id: "3",
    name: "Bâtir Pro",
    profession: "Maçon",
    distanceKm: 2.1,
    rating: 4.7,
    reviews: 74,
    priceFrom: 8000,
    priceTo: 15000,
    verified: true,
    available: false,
    zone: "Yopougon",
  },
  {
    id: "4",
    name: "Fraîcheur Plus",
    profession: "Climaticien",
    distanceKm: 1.9,
    rating: 5.0,
    reviews: 52,
    priceFrom: 6000,
    priceTo: 9000,
    verified: true,
    available: true,
    zone: "Angré",
  },
  {
    id: "5",
    name: "Style Aïcha",
    profession: "Coiffeuse",
    distanceKm: 0.6,
    rating: 4.9,
    reviews: 210,
    priceFrom: 3000,
    priceTo: 6000,
    verified: true,
    available: true,
    zone: "Plateau",
  },
  {
    id: "6",
    name: "SécuritéClef",
    profession: "Serrurier",
    distanceKm: 2.6,
    rating: 4.6,
    reviews: 41,
    priceFrom: 4000,
    priceTo: 7000,
    verified: true,
    available: true,
    zone: "Bingerville",
  },
];
