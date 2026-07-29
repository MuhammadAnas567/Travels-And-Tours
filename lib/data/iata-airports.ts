export type AirportOption = {
  code: string;
  city: string;
  airport: string;
  country: string;
};

/** Popular shortcuts shown when the airport field is empty / focused. */
export const POPULAR_AIRPORT_CODES = [
  "KHI",
  "LHE",
  "ISB",
  "PEW",
  "DXB",
  "AUH",
  "DOH",
  "JED",
  "RUH",
  "IST",
  "LHR",
  "JFK",
  "KUL",
  "BKK",
] as const;

/**
 * @deprecated Prefer `/api/airports/search` (full commercial dataset).
 * Kept as a static popular shortlist for empty-state chips.
 */
export const AIRPORT_OPTIONS: AirportOption[] = [
  { code: "KHI", city: "Karachi", airport: "Jinnah International", country: "Pakistan" },
  { code: "LHE", city: "Lahore", airport: "Allama Iqbal International", country: "Pakistan" },
  { code: "ISB", city: "Islamabad", airport: "Islamabad International", country: "Pakistan" },
  { code: "PEW", city: "Peshawar", airport: "Bacha Khan International", country: "Pakistan" },
  { code: "DXB", city: "Dubai", airport: "Dubai International", country: "United Arab Emirates" },
  { code: "AUH", city: "Abu Dhabi", airport: "Zayed International", country: "United Arab Emirates" },
  { code: "DOH", city: "Doha", airport: "Hamad International", country: "Qatar" },
  { code: "JED", city: "Jeddah", airport: "King Abdulaziz International", country: "Saudi Arabia" },
  { code: "RUH", city: "Riyadh", airport: "King Khalid International", country: "Saudi Arabia" },
  { code: "IST", city: "Istanbul", airport: "Istanbul Airport", country: "Turkey" },
  { code: "LHR", city: "London", airport: "Heathrow", country: "United Kingdom" },
  { code: "JFK", city: "New York", airport: "John F. Kennedy International", country: "United States" },
  { code: "KUL", city: "Kuala Lumpur", airport: "Kuala Lumpur International", country: "Malaysia" },
  { code: "BKK", city: "Bangkok", airport: "Suvarnabhumi", country: "Thailand" },
];
