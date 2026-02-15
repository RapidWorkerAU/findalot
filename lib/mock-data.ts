import type { Agency, Listing } from "@/lib/types";

export const agencies: Agency[] = [
  {
    slug: "findalot-realty-perth-hills",
    name: "Findalot Realty – Perth Hills",
    region: "Perth, WA",
    blurb: "A modern agency focused on clean marketing, fast comms, and no-nonsense sales execution.",
  },
  {
    slug: "coastal-corner-re",
    name: "Coastal Corner Real Estate",
    region: "Sunshine Coast, QLD",
    blurb: "Local specialists for family homes and coastal lifestyle properties.",
  },
];

export const listings: Listing[] = [
  {
    id: "l_aveley_18_paperbark",
    title: "Modern Family Home with Pool | 4×2 in Aveley",
    address: "18 Paperbark Loop, Aveley WA 6069",
    priceDisplay: "Offers from ,000",
    beds: 4,
    baths: 2,
    parking: 2,
    landSizeSqm: 512,
    propertyType: "House",
    features: ["Pool", "Solar", "Theatre Room", "Study", "Alfresco", "Ducted A/C"],
    description:
      "Clean lines, open-plan living, and an entertainer’s backyard with a pool.\nMinutes to parks, schools, and shopping.\nIdeal for families wanting space without the maintenance headache. (Yes, you can still have both.)",
    tier: "premium",
    status: "active",
    agencySlug: "findalot-realty-perth-hills",
    images: [
      { category: "photo", label: "Front elevation" },
      { category: "photo", label: "Kitchen + living" },
      { category: "floorplan", label: "Floor plan (single level)" },
      { category: "other", label: "Site plan" },
    ],
  },
  {
    id: "l_midvale_9_jarrah",
    title: "Renovated 3×1 with Big Backyard",
    address: "9 Jarrah Street, Midvale WA 6056",
    priceDisplay: "From ,000",
    beds: 3,
    baths: 1,
    parking: 2,
    landSizeSqm: 720,
    propertyType: "House",
    features: ["Renovated", "Large yard", "Workshop"],
    description:
      "Fresh finishes, practical layout, and a backyard big enough for a dog, a trampoline, and your weekend projects.\nClose to shops and transport.",
    tier: "standard",
    status: "active",
    agencySlug: "findalot-realty-perth-hills",
    images: [
      { category: "photo", label: "Street view" },
      { category: "photo", label: "Living room" },
      { category: "floorplan", label: "Floor plan" },
    ],
  },
  {
    id: "l_buderim_2_orchid",
    title: "Easy Coastal Living | 2×2 Apartment",
    address: "2 Orchid Lane, Buderim QLD 4556",
    priceDisplay: "Guide ,000",
    beds: 2,
    baths: 2,
    parking: 1,
    propertyType: "Apartment",
    features: ["Balcony", "Secure parking", "Near cafes"],
    description:
      "Light-filled apartment with a calm, modern feel.\nIdeal for downsizers or low-maintenance living near the coast.",
    tier: "free",
    status: "sold",
    soldDate: "12 Jan 2026",
    soldPriceDisplay: "Sold for ,500",
    agencySlug: "coastal-corner-re",
    images: [
      { category: "photo", label: "Balcony outlook" },
      { category: "photo", label: "Bedroom" },
      { category: "floorplan", label: "Floor plan" },
    ],
  },
];
