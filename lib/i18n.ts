import pt from "@/dictionaries/pt";
import en from "@/dictionaries/en";
import es from "@/dictionaries/es";
import fr from "@/dictionaries/fr";
import de from "@/dictionaries/de";
import type { Dict } from "@/dictionaries/pt";

export const locales = ["pt", "en", "fr", "de", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

const dictionaries: Record<Locale, Dict> = { pt, en, es, fr, de };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}

export type { Dict };
