export type LatLng = { lat: number; lng: number };

/** Approximate city centers for map pins when hotel coords are missing */
export const CITY_COORDS: Record<string, LatLng> = {
  karachi: { lat: 24.8607, lng: 67.0011 },
  lahore: { lat: 31.5204, lng: 74.3587 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  rawalpindi: { lat: 33.5651, lng: 73.0169 },
  peshawar: { lat: 34.0151, lng: 71.5249 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  "abu dhabi": { lat: 24.4539, lng: 54.3773 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  doha: { lat: 25.2854, lng: 51.531 },
  jeddah: { lat: 21.4858, lng: 39.1925 },
  riyadh: { lat: 24.7136, lng: 46.6753 },
  makkah: { lat: 21.3891, lng: 39.8579 },
  madinah: { lat: 24.5247, lng: 39.5692 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  maldives: { lat: 4.1755, lng: 73.5093 },
  bali: { lat: -8.3405, lng: 115.092 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  santorini: { lat: 36.3932, lng: 25.4615 },
  "cape town": { lat: -33.9249, lng: 18.4241 },
  "swiss alps": { lat: 46.8182, lng: 8.2275 },
  "new york": { lat: 40.7128, lng: -74.006 },
};

export function coordsForCity(city: string): LatLng {
  const key = city.trim().toLowerCase();
  return CITY_COORDS[key] ?? { lat: 24.8607, lng: 67.0011 };
}

/** Alias used by hotel / destination pages */
export const resolveCityCoords = coordsForCity;
