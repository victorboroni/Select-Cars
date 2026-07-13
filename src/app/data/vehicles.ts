// SelectCars — acervo de referência (seed local / fallback).
// Os mesmos dados foram persistidos no Supabase (vehicles + storage).
const STORAGE_BASE =
  "https://krpzgngzdqtokybgkwcz.supabase.co/storage/v1/object/public/vehicle-images";

export type Badge =
  | "RARO"
  | "ÚLTIMA UNIDADE"
  | "NOVO"
  | "RESERVADO"
  | "EDIÇÃO LIMITADA";
export type Category =
  | "Esportivos"
  | "Clássicos"
  | "SUV Premium"
  | "Edições limitadas"
  | "Recém-chegados";
export type Body = "Coupé" | "Sedan" | "GT" | "Conversível" | "SUV";
export type Gearbox = "PDK" | "DCT" | "Automático";
export type Fuel = "Gasolina" | "Híbrido";
export type VehicleStatus = "Publicado" | "Pausado" | "Rascunho";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  color: string;
  category: Category;
  body: Body;
  gearbox: Gearbox;
  fuel: Fuel;
  badge?: Badge;
  price: number | null; // null = "Sob consulta"
  available: boolean;
  description: string;
  image: string;
  heroImage?: string;
  status?: VehicleStatus; // gerenciado no painel; ausente = "Publicado"
  createdAt?: string; // ISO date
  version?: string;
  owners?: number;
  provenance?: string;
  specs: {
    engine: string;
    topSpeed: string;
    transmission: string;
    fuel: string;
  };
  highlights: string[];
}

export const vehicles: Vehicle[] = [
  {
    id: "porsche-911-gt3-rs",
    brand: "Porsche",
    model: "911 GT3 RS",
    year: 2024,
    km: 1200,
    color: "Branco Carrara",
    category: "Esportivos",
    body: "Coupé",
    gearbox: "PDK",
    fuel: "Gasolina",
    badge: "RARO",
    price: 2890000,
    available: true,
    description:
      "Aero kit Weissach, bancos em fibra de carbono e procedência impecável de primeiro dono.",
    image: `${STORAGE_BASE}/porsche-911-gt3-rs/cover.png`,
    heroImage: `${STORAGE_BASE}/porsche-911-gt3-rs/hero.png`,
    specs: {
      engine: "4.0L Boxer 6 aspirado · 525 cv · 0–100 km/h em 3.2s",
      topSpeed: "296 km/h",
      transmission: "Tração traseira · PDK 7 velocidades",
      fuel: "13.6 / 8.9 L/100 km · Combinado · WLTP",
    },
    highlights: [
      "Aero kit Weissach completo",
      "Teto em magnésio",
      'Rodas forjadas 20"',
      "Bancos em fibra de carbono",
    ],
  },
  {
    id: "ferrari-296-gtb",
    brand: "Ferrari",
    model: "296 GTB",
    year: 2023,
    km: 3400,
    color: "Rosso Corsa",
    category: "Esportivos",
    body: "Coupé",
    gearbox: "DCT",
    fuel: "Híbrido",
    badge: "ÚLTIMA UNIDADE",
    price: null,
    available: true,
    description:
      "V6 híbrido turbinado, 830 cv combinados. Histórico completo e revisão oficial.",
    image: `${STORAGE_BASE}/ferrari-296-gtb/cover.png`,
    specs: {
      engine: "3.0L V6 turbo híbrido · 830 cv combinados",
      topSpeed: "330 km/h",
      transmission: "Tração traseira · DCT 8 velocidades",
      fuel: "Híbrido plug-in",
    },
    highlights: [
      "Pacote Assetto Fiorano",
      "Freios carbocerâmicos",
      "Modo elétrico eDrive",
      "Revisão oficial em dia",
    ],
  },
  {
    id: "lamborghini-huracan-tecnica",
    brand: "Lamborghini",
    model: "Huracán Tecnica",
    year: 2024,
    km: 800,
    color: "Verde Mantis",
    category: "Recém-chegados",
    body: "Coupé",
    gearbox: "DCT",
    fuel: "Gasolina",
    badge: "NOVO",
    price: 3450000,
    available: true,
    description:
      "V10 aspirado, dinâmica de pista, configuração específica para a unidade.",
    image: `${STORAGE_BASE}/lamborghini-huracan-tecnica/cover.png`,
    specs: {
      engine: "5.2L V10 aspirado · 640 cv",
      topSpeed: "325 km/h",
      transmission: "Tração traseira · DCT 7 velocidades",
      fuel: "Gasolina",
    },
    highlights: [
      "Direção nas rodas traseiras",
      "Rodas Damiso forjadas",
      "Escapamento esportivo",
      "Configuração de fábrica única",
    ],
  },
  {
    id: "mercedes-amg-gt-63-s",
    brand: "Mercedes-AMG",
    model: "GT 63 S",
    year: 2023,
    km: 5100,
    color: "Preto Obsidiana",
    category: "Esportivos",
    body: "Sedan",
    gearbox: "Automático",
    fuel: "Gasolina",
    price: 1690000,
    available: true,
    description:
      "Quatro portas com motor 4.0 V8 biturbo. Acabamento Designo e laudo independente.",
    image: `${STORAGE_BASE}/mercedes-amg-gt-63-s/cover.png`,
    specs: {
      engine: "4.0L V8 biturbo · 639 cv",
      topSpeed: "315 km/h",
      transmission: "Tração integral · AMG Speedshift 9G",
      fuel: "Gasolina",
    },
    highlights: [
      "Acabamento Designo",
      "Bancos AMG Performance",
      "Laudo independente",
      "Pacote aerodinâmico",
    ],
  },
  {
    id: "aston-martin-db12",
    brand: "Aston Martin",
    model: "DB12",
    year: 2024,
    km: 1500,
    color: "British Racing Green",
    category: "Edições limitadas",
    body: "GT",
    gearbox: "Automático",
    fuel: "Gasolina",
    badge: "RESERVADO",
    price: null,
    available: false,
    description:
      "GT inglês com 680 cv. Couro Bridge of Weir e detalhes em alumínio escovado.",
    image: `${STORAGE_BASE}/aston-martin-db12/cover.png`,
    specs: {
      engine: "4.0L V8 biturbo · 680 cv",
      topSpeed: "325 km/h",
      transmission: "Tração traseira · ZF 8 velocidades",
      fuel: "Gasolina",
    },
    highlights: [
      "Couro Bridge of Weir",
      "Detalhes em alumínio escovado",
      "Som Bowers & Wilkins",
      "Configuração Q by Aston Martin",
    ],
  },
  {
    id: "bentley-continental-gt-speed",
    brand: "Bentley",
    model: "Continental GT Speed",
    year: 2023,
    km: 6800,
    color: "Orange Flame",
    category: "Esportivos",
    body: "GT",
    gearbox: "Automático",
    fuel: "Gasolina",
    price: 2150000,
    available: true,
    description:
      "GT de 12 cilindros, interior em couro Mulliner, presença para qualquer agenda.",
    image: `${STORAGE_BASE}/bentley-continental-gt-speed/cover.png`,
    specs: {
      engine: "6.0L W12 biturbo · 659 cv",
      topSpeed: "335 km/h",
      transmission: "Tração integral · DCT 8 velocidades",
      fuel: "Gasolina",
    },
    highlights: [
      "Interior em couro Mulliner",
      'Rodas 22" polidas',
      "Suspensão pneumática",
      "Acabamento Orange Flame único",
    ],
  },
];

export const categories: Category[] = [
  "Esportivos",
  "Clássicos",
  "SUV Premium",
  "Edições limitadas",
  "Recém-chegados",
];

export const formatBRL = (value: number | null) =>
  value === null
    ? "Sob consulta"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(value);

export const formatKm = (km: number) =>
  `${new Intl.NumberFormat("pt-BR").format(km)} km`;

export const bodies: Body[] = ["Coupé", "Sedan", "GT", "Conversível", "SUV"];
export const gearboxes: Gearbox[] = ["PDK", "DCT", "Automático"];
export const fuels: Fuel[] = ["Gasolina", "Híbrido"];
export const badgeOptions: Badge[] = [
  "RARO",
  "ÚLTIMA UNIDADE",
  "NOVO",
  "EDIÇÃO LIMITADA",
  "RESERVADO",
];
export const statusOptions: VehicleStatus[] = [
  "Publicado",
  "Pausado",
  "Rascunho",
];
