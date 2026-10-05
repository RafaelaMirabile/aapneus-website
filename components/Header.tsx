"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, MapPin, Menu, Phone, X } from "lucide-react";
import { locales, type Dict, type Locale } from "@/lib/i18n";
import { site, whatsappUrl } from "@/lib/site";
import { FacebookIcon, WhatsAppIcon } from "./BrandIcons";
import { OpenStatus } from "./OpenStatus";

export function Header({ t, locale, names }: { t: Dict; locale: Locale; names: Record<Locale, string> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "#finder", label: t.nav.finder },
    { href: "#tyres", label: t.nav.tyres },
    { href: "#services", label: t.nav.services },
    { href: "#about", label: t.nav.about },
    { href: "#contact", label: t.nav.contact },
  ];

  const changeLocale = (next: string) => router.push(`/${next}${window.location.hash}`);

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <OpenStatus t={t} />
          <span className="topbar__addr">
            <MapPin size={15} aria-hidden="true" /> {site.address.street}, {site.address.city}
          </span>
          <div className="topbar__right">
            <a href={`tel:${site.phone}`} className="topbar__link">
              <Phone size={15} aria-hidden="true" /> {site.phoneDisplay}
            </a>
            <a href={site.social.facebook} className="topbar__link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon size={16} />
            </a>
            <label className="lang">
              <Globe size={15} aria-hidden="true" />
              <span className="sr-only">{t.nav.language}</span>
              <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
                {locales.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()} · {names[l]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container header__inner">
          <a href={`/${locale}`} className="brand" aria-label={`${site.name} — home`}>
            <Image src="/images/logo-aap.jpg" alt="" width={52} height={52} className="brand__logo" priority />
            <span className="brand__text">
              <span className="brand__name">
                <span className="brand__aa">A.A.</span>PNEUS
              </span>
              <span className="brand__sub">{t.hero.badge}</span>
            </span>
          </a>

          <nav aria-label="Main" className="nav">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="nav__link">
                {l.label}
              </a>
            ))}
          </nav>

          <a href={whatsappUrl()} className="btn btn--yellow header__cta" target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} /> WhatsApp
          </a>

          <button
            type="button"
            className="header__burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
            <span className="sr-only">{open ? t.nav.close : t.nav.menu}</span>
          </button>
        </div>
        <div className="stripe" aria-hidden="true" />

        <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} hidden={!open}>
          <nav aria-label="Mobile" className="mobile-menu__nav">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mobile-menu__actions">
            <a href={whatsappUrl()} className="btn btn--yellow" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} /> WhatsApp
            </a>
            <a href={`tel:${site.phone}`} className="btn btn--outline">
              <Phone size={18} aria-hidden="true" /> {site.phoneDisplay}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
