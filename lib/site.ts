// Business details. Edit this file to update contacts, hours and brands everywhere on the site.

export const site = {
  name: "A.A.Pneus",
  url: "https://www.aapneus.com",
  whatsapp: "351912297577", // international format, digits only (used for wa.me links)
  whatsappDisplay: "+351 912 297 577",
  carWashWhatsapp: "351928341261", // WhatsApp for the car wash service card
  phone: "+351912297577",
  phoneDisplay: "912 297 577",
  address: {
    street: "R. da Povoença 331",
    postalCode: "4900-874",
    city: "Viana do Castelo",
    country: "PT",
  },
  social: {
    facebook: "https://www.facebook.com/p/AAPneus-100086673592273/",
  },
  // Brands shown in the brand strip. Add or remove freely.
  brands: ["Michelin", "Hankook", "Goodyear", "Bridgestone", "Continental", "Pirelli", "Dunlop", "BFGoodrich"],
};

export const fullAddress = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

export const mapsQuery = encodeURIComponent(`A.A.Pneus, ${fullAddress}`);
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

export function whatsappUrl(message?: string, number: string = site.whatsapp) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Opening hours in minutes from midnight, Europe/Lisbon time.
// Index 0 = Sunday … 6 = Saturday. Mon–Fri closes for lunch 12:00–13:00.
export type Range = [number, number];
const weekday: Range[] = [
  [9 * 60, 12 * 60],
  [13 * 60, 18 * 60],
];
export const hours: Range[][] = [
  [], // Sunday
  weekday,
  weekday,
  weekday,
  weekday,
  weekday,
  [[9 * 60, 13 * 60]], // Saturday
];

export function fmtTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}
