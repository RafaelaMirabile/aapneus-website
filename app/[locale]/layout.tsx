import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { site } from "@/lib/site";
import "../globals.css";

const display = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#0e0e10" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      locale,
      images: ["/images/oficina-entrada.webp"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
