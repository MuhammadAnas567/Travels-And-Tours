export type FallbackVisa = {
  id: string;
  country: string;
  countrySlug: string;
  flagEmoji: string;
  visaType: string;
  requirements: string;
  documentChecklist: string[];
  processingTime: string;
  govFee: number;
  serviceFee: number;
  successNotes: string;
  isActive: boolean;
};

export const FALLBACK_VISAS: FallbackVisa[] = [
  {
    id: "fb-visa-uae",
    country: "United Arab Emirates",
    countrySlug: "uae",
    flagEmoji: "AE",
    visaType: "Tourist Visa",
    requirements: "Tourist visa via licensed agency for most Pakistani applicants.",
    documentChecklist: ["Passport", "Photo", "Bank statement"],
    processingTime: "3–5 working days",
    govFee: 350,
    serviceFee: 8000,
    successNotes: "Express options available.",
    isActive: true,
  },
  {
    id: "fb-visa-turkey",
    country: "Turkey",
    countrySlug: "turkey",
    flagEmoji: "TR",
    visaType: "Tourist e-Visa",
    requirements: "e-Visa for eligible Pakistani passport holders.",
    documentChecklist: ["Passport", "Return ticket", "Hotel booking"],
    processingTime: "24–72 hours",
    govFee: 60,
    serviceFee: 5000,
    successNotes: "We track status until approval.",
    isActive: true,
  },
  {
    id: "fb-visa-saudi",
    country: "Saudi Arabia",
    countrySlug: "saudi-arabia",
    flagEmoji: "SA",
    visaType: "Umrah / Tourist",
    requirements: "Umrah and tourist visas through authorised agents.",
    documentChecklist: ["Passport", "Vaccination", "Insurance"],
    processingTime: "5–7 working days",
    govFee: 200,
    serviceFee: 10000,
    successNotes: "Often bundled with Umrah packages.",
    isActive: true,
  },
  {
    id: "fb-visa-malaysia",
    country: "Malaysia",
    countrySlug: "malaysia",
    flagEmoji: "MY",
    visaType: "eVISA",
    requirements: "Malaysia eVISA for tourism.",
    documentChecklist: ["Passport scan", "Photo", "Return flight"],
    processingTime: "2–4 working days",
    govFee: 45,
    serviceFee: 4500,
    successNotes: "Straightforward online process with our checklist.",
    isActive: true,
  },
  {
    id: "fb-visa-uk",
    country: "United Kingdom",
    countrySlug: "united-kingdom",
    flagEmoji: "GB",
    visaType: "Standard Visitor",
    requirements: "UK visitor visa with biometrics and supporting docs.",
    documentChecklist: ["Passport", "Bank statements", "Itinerary", "Ties to home"],
    processingTime: "3–6 weeks",
    govFee: 115,
    serviceFee: 15000,
    successNotes: "We review your file before submission.",
    isActive: true,
  },
  {
    id: "fb-visa-schengen",
    country: "Schengen (Europe)",
    countrySlug: "schengen",
    flagEmoji: "EU",
    visaType: "Short Stay C",
    requirements: "Schengen short-stay via the main destination consulate.",
    documentChecklist: ["Passport", "Travel insurance", "Hotel bookings", "Funds proof"],
    processingTime: "2–4 weeks",
    govFee: 80,
    serviceFee: 18000,
    successNotes: "Appointment coaching included.",
    isActive: true,
  },
];
