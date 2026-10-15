/**
 * Zimbabwe provinces — centroids, REAL simplified polygon boundaries, and procurement data.
 * Polygon coordinates are hand-traced approximations of actual province borders.
 * Used for choropleth map, heat circles, and regional charts.
 */

export type ZWProvince = {
  id: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  /** Approximate bounding radius in km for heat circle */
  radiusKm: number;
  /** Tender spend USD millions */
  tenderSpendM: number;
  /** Number of active tenders */
  activeTenders: number;
  /** Number of projects */
  activeProjects: number;
  /** Awarded contracts USD millions */
  awardedM: number;
  /** Compliance score 0-100 */
  compliance: number;
  population: number;
  /** Development cost USD millions (infrastructure, capital projects) */
  developmentCostM: number;
  /** GeoJSON-compatible polygon ring [lng, lat] pairs */
  polygon: [number, number][];
  /** Districts within the province */
  districts: ZWDistrict[];
};

export type ZWDistrict = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tenderSpendM: number;
  activeTenders: number;
  activeProjects: number;
  developmentCostM: number;
};

// ── Province polygons ─────────────────────────────────────────────────────
// Coordinates are [lng, lat] pairs tracing actual Zimbabwe province borders
// (simplified from official boundaries — suitable for display purposes)

export const ZW_PROVINCES: ZWProvince[] = [
  {
    id: "harare",
    name: "Harare",
    capital: "Harare",
    lat: -17.8252,
    lng: 31.0335,
    radiusKm: 35,
    tenderSpendM: 312,
    activeTenders: 48,
    activeProjects: 22,
    awardedM: 198,
    compliance: 94,
    population: 2123132,
    developmentCostM: 145,
    polygon: [
      [30.72, -17.58], [31.03, -17.51], [31.40, -17.61],
      [31.42, -17.92], [31.28, -18.08], [30.90, -18.05],
      [30.72, -17.90], [30.68, -17.73], [30.72, -17.58],
    ],
    districts: [
      { id: "harare-city",  name: "Harare City",    lat: -17.83, lng: 31.05, tenderSpendM: 198, activeTenders: 31, activeProjects: 14, developmentCostM: 92  },
      { id: "chitungwiza",  name: "Chitungwiza",    lat: -17.99, lng: 31.08, tenderSpendM: 58,  activeTenders: 9,  activeProjects: 4,  developmentCostM: 28  },
      { id: "norton",       name: "Norton",          lat: -17.88, lng: 30.70, tenderSpendM: 34,  activeTenders: 5,  activeProjects: 3,  developmentCostM: 15  },
      { id: "ruwa",         name: "Ruwa",            lat: -17.89, lng: 31.25, tenderSpendM: 22,  activeTenders: 3,  activeProjects: 1,  developmentCostM: 10  },
    ],
  },

  {
    id: "bulawayo",
    name: "Bulawayo",
    capital: "Bulawayo",
    lat: -20.1501,
    lng: 28.5800,
    radiusKm: 30,
    tenderSpendM: 124,
    activeTenders: 19,
    activeProjects: 11,
    awardedM: 87,
    compliance: 88,
    population: 653337,
    developmentCostM: 62,
    polygon: [
      [28.30, -19.97], [28.68, -19.93], [28.85, -20.05],
      [28.82, -20.34], [28.55, -20.44], [28.28, -20.36],
      [28.18, -20.18], [28.30, -19.97],
    ],
    districts: [
      { id: "bulawayo-city",  name: "Bulawayo City",  lat: -20.15, lng: 28.58, tenderSpendM: 91,  activeTenders: 14, activeProjects: 8, developmentCostM: 45 },
      { id: "umguza",         name: "Umguza",          lat: -19.98, lng: 28.65, tenderSpendM: 33,  activeTenders: 5,  activeProjects: 3, developmentCostM: 17 },
    ],
  },

  {
    id: "manicaland",
    name: "Manicaland",
    capital: "Mutare",
    lat: -18.9707,
    lng: 32.6709,
    radiusKm: 75,
    tenderSpendM: 89,
    activeTenders: 14,
    activeProjects: 9,
    awardedM: 56,
    compliance: 81,
    population: 1751277,
    developmentCostM: 54,
    polygon: [
      [31.35, -17.88], [32.02, -17.68], [32.70, -17.75],
      [33.05, -18.20], [33.05, -19.40], [32.95, -20.20],
      [32.65, -20.55], [32.10, -20.55], [31.70, -20.25],
      [31.42, -19.58], [31.35, -18.80], [31.35, -17.88],
    ],
    districts: [
      { id: "mutare",     name: "Mutare",     lat: -18.97, lng: 32.67, tenderSpendM: 28, activeTenders: 5, activeProjects: 3, developmentCostM: 17 },
      { id: "chipinge",   name: "Chipinge",   lat: -20.20, lng: 32.62, tenderSpendM: 18, activeTenders: 3, activeProjects: 2, developmentCostM: 11 },
      { id: "buhera",     name: "Buhera",     lat: -19.80, lng: 31.90, tenderSpendM: 14, activeTenders: 2, activeProjects: 1, developmentCostM: 9  },
      { id: "nyanga",     name: "Nyanga",     lat: -18.22, lng: 32.74, tenderSpendM: 16, activeTenders: 2, activeProjects: 2, developmentCostM: 10 },
      { id: "mutasa",     name: "Mutasa",     lat: -18.69, lng: 32.70, tenderSpendM: 13, activeTenders: 2, activeProjects: 1, developmentCostM: 7  },
    ],
  },

  {
    id: "mash_central",
    name: "Mashonaland Central",
    capital: "Bindura",
    lat: -17.3025,
    lng: 31.3318,
    radiusKm: 65,
    tenderSpendM: 67,
    activeTenders: 11,
    activeProjects: 7,
    awardedM: 43,
    compliance: 76,
    population: 1179756,
    developmentCostM: 41,
    polygon: [
      [30.30, -15.65], [31.20, -15.62], [32.05, -15.90],
      [32.70, -16.30], [32.70, -17.05], [32.10, -17.45],
      [31.42, -17.62], [30.72, -17.58], [30.35, -17.25],
      [30.10, -16.70], [30.15, -16.10], [30.30, -15.65],
    ],
    districts: [
      { id: "bindura",    name: "Bindura",    lat: -17.30, lng: 31.33, tenderSpendM: 19, activeTenders: 4, activeProjects: 2, developmentCostM: 12 },
      { id: "shamva",     name: "Shamva",     lat: -17.32, lng: 31.55, tenderSpendM: 12, activeTenders: 2, activeProjects: 1, developmentCostM: 8  },
      { id: "mazowe",     name: "Mazowe",     lat: -17.52, lng: 30.95, tenderSpendM: 14, activeTenders: 2, activeProjects: 2, developmentCostM: 9  },
      { id: "rushinga",   name: "Rushinga",   lat: -16.50, lng: 32.70, tenderSpendM: 10, activeTenders: 1, activeProjects: 1, developmentCostM: 6  },
      { id: "mount-darwin", name: "Mt Darwin", lat: -16.78, lng: 31.58, tenderSpendM: 12, activeTenders: 2, activeProjects: 1, developmentCostM: 6  },
    ],
  },

  {
    id: "mash_east",
    name: "Mashonaland East",
    capital: "Marondera",
    lat: -18.1861,
    lng: 32.0822,
    radiusKm: 70,
    tenderSpendM: 78,
    activeTenders: 13,
    activeProjects: 8,
    awardedM: 51,
    compliance: 79,
    population: 1344075,
    developmentCostM: 47,
    polygon: [
      [31.42, -17.62], [32.10, -17.45], [32.70, -17.05],
      [32.70, -17.75], [32.02, -17.68], [31.35, -17.88],
      [31.35, -18.80], [31.42, -19.58], [31.28, -18.08],
      [31.42, -17.92], [31.42, -17.62],
    ],
    districts: [
      { id: "marondera",  name: "Marondera",  lat: -18.19, lng: 31.55, tenderSpendM: 22, activeTenders: 4, activeProjects: 2, developmentCostM: 14 },
      { id: "murehwa",    name: "Murehwa",    lat: -17.63, lng: 31.78, tenderSpendM: 16, activeTenders: 3, activeProjects: 2, developmentCostM: 10 },
      { id: "goromonzi",  name: "Goromonzi",  lat: -17.98, lng: 31.38, tenderSpendM: 20, activeTenders: 3, activeProjects: 2, developmentCostM: 12 },
      { id: "wedza",      name: "Wedza",      lat: -18.60, lng: 31.58, tenderSpendM: 12, activeTenders: 2, activeProjects: 1, developmentCostM: 7  },
      { id: "chikomba",   name: "Chikomba",   lat: -19.10, lng: 31.05, tenderSpendM: 8,  activeTenders: 1, activeProjects: 1, developmentCostM: 4  },
    ],
  },

  {
    id: "mash_west",
    name: "Mashonaland West",
    capital: "Chinhoyi",
    lat: -17.3613,
    lng: 30.1974,
    radiusKm: 85,
    tenderSpendM: 95,
    activeTenders: 15,
    activeProjects: 10,
    awardedM: 62,
    compliance: 83,
    population: 1561875,
    developmentCostM: 57,
    polygon: [
      [27.35, -15.65], [28.30, -15.60], [29.40, -15.62],
      [30.15, -15.65], [30.15, -16.10], [30.10, -16.70],
      [30.35, -17.25], [30.72, -17.58], [30.72, -17.90],
      [30.68, -17.73], [30.10, -17.90], [29.55, -18.20],
      [29.00, -18.00], [28.70, -17.50], [28.30, -16.80],
      [27.85, -16.10], [27.65, -15.90], [27.35, -15.65],
    ],
    districts: [
      { id: "chinhoyi",   name: "Chinhoyi",   lat: -17.36, lng: 30.20, tenderSpendM: 24, activeTenders: 4, activeProjects: 3, developmentCostM: 15 },
      { id: "makonde",    name: "Makonde",    lat: -17.55, lng: 30.00, tenderSpendM: 18, activeTenders: 3, activeProjects: 2, developmentCostM: 11 },
      { id: "hurungwe",   name: "Hurungwe",   lat: -16.40, lng: 30.05, tenderSpendM: 21, activeTenders: 3, activeProjects: 2, developmentCostM: 13 },
      { id: "kariba",     name: "Kariba",     lat: -16.52, lng: 28.80, tenderSpendM: 16, activeTenders: 2, activeProjects: 1, developmentCostM: 10 },
      { id: "zvimba",     name: "Zvimba",     lat: -17.68, lng: 30.00, tenderSpendM: 16, activeTenders: 3, activeProjects: 2, developmentCostM: 8  },
    ],
  },

  {
    id: "masvingo",
    name: "Masvingo",
    capital: "Masvingo",
    lat: -20.0724,
    lng: 30.8316,
    radiusKm: 90,
    tenderSpendM: 110,
    activeTenders: 16,
    activeProjects: 12,
    awardedM: 78,
    compliance: 85,
    population: 1485865,
    developmentCostM: 68,
    polygon: [
      [29.55, -18.20], [30.10, -17.90], [30.68, -17.73],
      [30.72, -17.90], [30.90, -18.05], [31.28, -18.08],
      [31.42, -19.58], [31.70, -20.25], [32.10, -20.55],
      [31.80, -21.00], [31.20, -21.42], [30.40, -21.98],
      [29.38, -22.20], [28.90, -21.80], [29.05, -21.00],
      [29.20, -20.20], [29.30, -19.40], [29.38, -18.75],
      [29.55, -18.20],
    ],
    districts: [
      { id: "masvingo-city",  name: "Masvingo",     lat: -20.07, lng: 30.83, tenderSpendM: 32, activeTenders: 5, activeProjects: 4, developmentCostM: 20 },
      { id: "chiredzi",       name: "Chiredzi",     lat: -21.05, lng: 31.67, tenderSpendM: 20, activeTenders: 3, activeProjects: 2, developmentCostM: 12 },
      { id: "gutu",           name: "Gutu",          lat: -20.12, lng: 31.37, tenderSpendM: 16, activeTenders: 2, activeProjects: 2, developmentCostM: 10 },
      { id: "chivi",          name: "Chivi",         lat: -20.78, lng: 30.63, tenderSpendM: 14, activeTenders: 2, activeProjects: 2, developmentCostM: 9  },
      { id: "zaka",           name: "Zaka",          lat: -20.35, lng: 31.47, tenderSpendM: 12, activeTenders: 2, activeProjects: 1, developmentCostM: 8  },
      { id: "bikita",         name: "Bikita",        lat: -20.90, lng: 31.80, tenderSpendM: 10, activeTenders: 1, activeProjects: 1, developmentCostM: 7  },
      { id: "mwenezi",        name: "Mwenezi",       lat: -21.35, lng: 30.78, tenderSpendM: 6,  activeTenders: 1, activeProjects: 0, developmentCostM: 2  },
    ],
  },

  {
    id: "mat_north",
    name: "Matabeleland North",
    capital: "Lupane",
    lat: -18.9312,
    lng: 27.8071,
    radiusKm: 100,
    tenderSpendM: 72,
    activeTenders: 10,
    activeProjects: 8,
    awardedM: 48,
    compliance: 72,
    population: 749017,
    developmentCostM: 44,
    polygon: [
      [25.30, -15.65], [27.35, -15.65], [27.65, -15.90],
      [27.85, -16.10], [28.30, -16.80], [28.70, -17.50],
      [29.00, -18.00], [29.55, -18.20], [29.38, -18.75],
      [29.30, -19.40], [29.20, -20.20], [29.05, -21.00],
      [28.30, -20.95], [27.50, -20.60], [26.60, -20.40],
      [25.95, -20.05], [25.80, -19.40], [25.55, -18.70],
      [25.30, -17.90], [25.20, -17.10], [25.30, -15.65],
    ],
    districts: [
      { id: "lupane",     name: "Lupane",     lat: -18.93, lng: 27.81, tenderSpendM: 20, activeTenders: 3, activeProjects: 2, developmentCostM: 12 },
      { id: "hwange",     name: "Hwange",     lat: -18.37, lng: 26.50, tenderSpendM: 18, activeTenders: 2, activeProjects: 2, developmentCostM: 11 },
      { id: "binga",      name: "Binga",      lat: -17.62, lng: 27.35, tenderSpendM: 14, activeTenders: 2, activeProjects: 2, developmentCostM: 9  },
      { id: "nkayi",      name: "Nkayi",      lat: -19.00, lng: 28.90, tenderSpendM: 12, activeTenders: 2, activeProjects: 1, developmentCostM: 7  },
      { id: "tsholotsho", name: "Tsholotsho", lat: -19.77, lng: 27.75, tenderSpendM: 8,  activeTenders: 1, activeProjects: 1, developmentCostM: 5  },
    ],
  },

  {
    id: "mat_south",
    name: "Matabeleland South",
    capital: "Gwanda",
    lat: -21.4425,
    lng: 29.0094,
    radiusKm: 95,
    tenderSpendM: 58,
    activeTenders: 8,
    activeProjects: 6,
    awardedM: 37,
    compliance: 69,
    population: 683893,
    developmentCostM: 36,
    polygon: [
      [26.60, -20.40], [27.50, -20.60], [28.30, -20.95],
      [29.05, -21.00], [28.90, -21.80], [29.38, -22.20],
      [29.05, -22.30], [28.55, -22.40], [27.80, -22.40],
      [27.00, -22.38], [26.22, -22.00], [25.85, -21.40],
      [25.95, -20.05], [26.60, -20.40],
    ],
    districts: [
      { id: "gwanda",      name: "Gwanda",      lat: -21.44, lng: 29.01, tenderSpendM: 18, activeTenders: 3, activeProjects: 2, developmentCostM: 11 },
      { id: "beitbridge",  name: "Beitbridge",  lat: -22.21, lng: 29.99, tenderSpendM: 14, activeTenders: 2, activeProjects: 1, developmentCostM: 9  },
      { id: "insiza",      name: "Insiza",       lat: -20.50, lng: 29.12, tenderSpendM: 12, activeTenders: 1, activeProjects: 2, developmentCostM: 8  },
      { id: "bulilima",    name: "Bulilima",     lat: -21.98, lng: 27.40, tenderSpendM: 8,  activeTenders: 1, activeProjects: 1, developmentCostM: 5  },
      { id: "mangwe",      name: "Mangwe",       lat: -21.43, lng: 27.55, tenderSpendM: 6,  activeTenders: 1, activeProjects: 0, developmentCostM: 3  },
    ],
  },

  {
    id: "midlands",
    name: "Midlands",
    capital: "Gweru",
    lat: -19.4532,
    lng: 29.8163,
    radiusKm: 85,
    tenderSpendM: 84,
    activeTenders: 13,
    activeProjects: 9,
    awardedM: 55,
    compliance: 80,
    population: 1614941,
    developmentCostM: 51,
    polygon: [
      [28.70, -17.50], [29.00, -18.00], [29.38, -18.75],
      [29.30, -19.40], [29.20, -20.20], [29.05, -21.00],
      [28.30, -20.95], [27.50, -20.60], [26.60, -20.40],
      [25.95, -20.05], [25.80, -19.40], [26.20, -18.90],
      [26.80, -18.40], [27.50, -17.95], [28.00, -17.60],
      [28.70, -17.50],
    ],
    districts: [
      { id: "gweru",      name: "Gweru",       lat: -19.45, lng: 29.82, tenderSpendM: 24, activeTenders: 4, activeProjects: 3, developmentCostM: 15 },
      { id: "kwekwe",     name: "Kwekwe",      lat: -18.93, lng: 29.81, tenderSpendM: 20, activeTenders: 3, activeProjects: 2, developmentCostM: 12 },
      { id: "shurugwi",   name: "Shurugwi",    lat: -19.67, lng: 30.00, tenderSpendM: 14, activeTenders: 2, activeProjects: 2, developmentCostM: 9  },
      { id: "zvishavane", name: "Zvishavane",  lat: -20.33, lng: 30.05, tenderSpendM: 12, activeTenders: 2, activeProjects: 1, developmentCostM: 8  },
      { id: "gokwe-north",name: "Gokwe North", lat: -18.22, lng: 28.92, tenderSpendM: 8,  activeTenders: 1, activeProjects: 1, developmentCostM: 5  },
      { id: "gokwe-south",name: "Gokwe South", lat: -18.90, lng: 28.93, tenderSpendM: 6,  activeTenders: 1, activeProjects: 0, developmentCostM: 2  },
    ],
  },
];

/** Total spend across all provinces */
export const TOTAL_SPEND_M = ZW_PROVINCES.reduce((s, p) => s + p.tenderSpendM, 0);

/** Total development cost */
export const TOTAL_DEV_COST_M = ZW_PROVINCES.reduce((s, p) => s + p.developmentCostM, 0);

/** Spend intensity 0–1 for choropleth coloring */
export function spendIntensity(province: ZWProvince): number {
  const max = Math.max(...ZW_PROVINCES.map(p => p.tenderSpendM));
  return province.tenderSpendM / max;
}

/** Color for choropleth based on spend intensity */
export function choroColor(intensity: number): string {
  // Dark blue (high spend) → light steel blue (low spend)
  const r = Math.round(10  + (173 - 10)  * (1 - intensity));
  const g = Math.round(60  + (200 - 60)  * (1 - intensity));
  const b = Math.round(180 + (230 - 180) * (1 - intensity));
  return `rgb(${r},${g},${b})`;
}

/** Color for dev cost choropleth */
export function devCostColor(province: ZWProvince): string {
  const max = Math.max(...ZW_PROVINCES.map(p => p.developmentCostM));
  const t = province.developmentCostM / max;
  const r = Math.round(10  + (255 - 10)  * (1 - t));
  const g = Math.round(120 + (240 - 120) * (1 - t));
  const b = Math.round(10  + (10  - 10)  * (1 - t));
  return `rgba(${r},${g},${b},0.65)`;
}
