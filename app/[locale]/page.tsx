import Image from "next/image";
import { ArrowRight, Check, Crosshair, Droplets, Gauge, MapPin, Navigation, Phone, Warehouse, Wrench } from "lucide-react";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { fullAddress, hours, mapsDirectionsUrl, mapsQuery, site, whatsappUrl } from "@/lib/site";
import { Header } from "@/components/Header";
import { TireFinder } from "@/components/TireFinder";
import { HoursTable } from "@/components/OpenStatus";
import { FacebookIcon, WhatsAppIcon } from "@/components/BrandIcons";

const serviceIcons = { fitting: Gauge, alignment: Crosshair, oil: Droplets, puncture: Wrench, storage: Warehouse } as const;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "pt") as Locale;
  const t = getDictionary(locale);
  const names = Object.fromEntries(locales.map((l) => [l, getDictionary(l).langName])) as Record<Locale, string>;
  const year = new Date().getFullYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TireShop",
    name: site.name,
    url: `${site.url}/${locale}`,
    image: `${site.url}/images/oficina-entrada.webp`,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: site.address.country,
    },
    sameAs: [site.social.facebook],
    openingHoursSpecification: hours.flatMap((ranges, d) =>
      ranges.map(([s, e]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d],
        opens: `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`,
        closes: `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`,
      })),
    ),
  };

  return (
    <>
      <a href="#main" className="skip">{t.skip}</a>
      <Header t={t} locale={locale} names={names} />

      <main id="main">
        {/* HERO */}
        <section className="hero">
          <div className="hero__tread" aria-hidden="true" />
          <div className="container hero__inner">
            <div className="hero__copy">
              <p className="eyebrow">{t.hero.eyebrow}</p>
              <h1 className="hero__title">
                <span>{t.hero.title1}</span>
                <span className="hero__title--yellow">{t.hero.title2}</span>
                <span className="hero__title--small">{t.hero.title3}</span>
              </h1>
              <p className="hero__lead">{t.hero.lead}</p>
              <div className="hero__ctas">
                <a href="#finder" className="btn btn--yellow btn--lg">
                  {t.hero.ctaFinder} <ArrowRight size={20} aria-hidden="true" />
                </a>
                <a href={`tel:${site.phone}`} className="btn btn--outline btn--lg">
                  <Phone size={18} aria-hidden="true" /> {t.hero.ctaCall} {site.phoneDisplay}
                </a>
              </div>
              <ul className="hero__chips">
                {t.hero.chips.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="hero__media">
              <div className="hero__slab" aria-hidden="true" />
              <div className="hero__photo">
                <Image
                  src="/images/oficina-entrada.webp"
                  alt={t.hero.photoAlt}
                  fill
                  priority
                  sizes="(max-width: 900px) 90vw, 440px"
                />
              </div>
              <div className="hero__badge">
                <Image src="/images/logo-aap.jpg" alt="" width={64} height={64} />
                <span>{t.hero.badge}</span>
              </div>
            </div>
          </div>
        </section>

        {/* TIRE FINDER */}
        <section id="finder" className="section section--finder" aria-labelledby="finder-title">
          <div className="container">
            <TireFinder t={t} />
          </div>
        </section>

        {/* TYRE CATEGORIES */}
        <section id="tyres" className="section section--light" aria-labelledby="tyres-title">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow eyebrow--red">{t.tyres.eyebrow}</p>
              <h2 id="tyres-title" className="h2">{t.tyres.title}</h2>
            </div>
            <ul className="tiles">
              {t.tyres.items.map((item) => (
                <li key={item.title} className="tile">
                  <Image
                    src={`/images/${item.img}.webp`}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="tile__img"
                  />
                  <div className="tile__body">
                    <h3 className="tile__title">{item.title}</h3>
                    <p className="tile__text">{item.text}</p>
                    <a
                      href={whatsappUrl(`${t.tyres.askMsg} ${item.title}`)}
                      className="tile__link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.tyres.ask} <ArrowRight size={18} aria-hidden="true" />
                      <span className="sr-only"> — {item.title}</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section section--dark" aria-labelledby="services-title">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">{t.services.eyebrow}</p>
              <h2 id="services-title" className="h2 h2--light">{t.services.title}</h2>
            </div>
            <ul className="services">
              {t.services.items.map((s, i) => {
                const Icon = serviceIcons[s.id as keyof typeof serviceIcons];
                return (
                  <li key={s.id} className="service">
                    <span className="service__num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <span className="service__icon" aria-hidden="true">
                      <Icon size={28} strokeWidth={2} />
                    </span>
                    <h3 className="service__title">{s.title}</h3>
                    <p className="service__text">{s.text}</p>
                    <a
                      href={whatsappUrl(`${t.services.bookMsg} ${s.title}`)}
                      className="service__link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon size={16} /> {t.services.book}
                      <span className="sr-only"> — {s.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* BRANDS */}
        <section className="brands" aria-labelledby="brands-title">
          <h2 id="brands-title" className="sr-only">{t.brands.title}</h2>
          <div className="brands__track">
            {[0, 1].map((copy) => (
              <ul key={copy} className="brands__list" aria-hidden={copy === 1 ? true : undefined}>
                {site.brands.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section section--light" aria-labelledby="about-title">
          <div className="container about">
            <div className="about__gallery">
              <div className="about__img about__img--a">
                <Image src="/images/montagem-pneus.webp" alt={t.tyres.items[0].alt} fill sizes="(max-width: 900px) 60vw, 340px" />
              </div>
              <div className="about__img about__img--b">
                <Image src="/images/stock-pneus.webp" alt={t.tyres.items[1].alt} fill sizes="(max-width: 900px) 40vw, 240px" />
              </div>
              <div className="about__img about__img--c">
                <Image src="/images/pneus-mota.webp" alt={t.tyres.items[2].alt} fill sizes="(max-width: 900px) 40vw, 240px" />
              </div>
            </div>
            <div className="about__copy">
              <p className="eyebrow eyebrow--red">{t.about.eyebrow}</p>
              <h2 id="about-title" className="h2">{t.about.title}</h2>
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <ul className="checks">
                {t.about.points.map((p) => (
                  <li key={p}>
                    <span className="checks__icon" aria-hidden="true"><Check size={16} strokeWidth={3} /></span>
                    {p}
                  </li>
                ))}
              </ul>
              <a href="#finder" className="btn btn--dark btn--lg">
                {t.hero.ctaFinder} <ArrowRight size={20} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section section--dark" aria-labelledby="contact-title">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">{t.contact.eyebrow}</p>
              <h2 id="contact-title" className="h2 h2--light">{t.contact.title}</h2>
            </div>
            <div className="contact">
              <div className="contact__info">
                <div className="info">
                  <MapPin className="info__icon" aria-hidden="true" />
                  <div>
                    <h3 className="info__label">{t.contact.address}</h3>
                    <p>{site.address.street}<br />{site.address.postalCode} {site.address.city}</p>
                    <a href={mapsDirectionsUrl} className="info__link" target="_blank" rel="noopener noreferrer">
                      <Navigation size={16} aria-hidden="true" /> {t.contact.directions}
                    </a>
                  </div>
                </div>
                <div className="info">
                  <Phone className="info__icon" aria-hidden="true" />
                  <div>
                    <h3 className="info__label">{t.contact.phone}</h3>
                    <a href={`tel:${site.phone}`} className="info__big">{site.phoneDisplay}</a>
                  </div>
                </div>
                <div className="info">
                  <WhatsAppIcon size={24} className="info__icon" />
                  <div>
                    <h3 className="info__label">{t.contact.whatsapp}</h3>
                    <a href={whatsappUrl()} className="info__big" target="_blank" rel="noopener noreferrer">{site.whatsappDisplay}</a>
                  </div>
                </div>
                <div className="info info--hours">
                  <div className="info__hours-head">
                    <h3 className="info__label">{t.contact.hours}</h3>
                    <span className="info__note">{t.contact.lunch}</span>
                  </div>
                  <HoursTable t={t} />
                </div>
                <a href={site.social.facebook} className="btn btn--outline" target="_blank" rel="noopener noreferrer">
                  <FacebookIcon size={18} /> {t.contact.follow} — Facebook
                </a>
              </div>
              <div className="contact__map">
                <iframe
                  title={t.contact.mapTitle}
                  src={`https://maps.google.com/maps?q=${mapsQuery}&hl=${locale}&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="stripe" aria-hidden="true" />
        <div className="container footer__inner">
          <div className="footer__brand">
            <Image src="/images/logo-aap.jpg" alt="" width={56} height={56} className="brand__logo" />
            <div>
              <p className="brand__name"><span className="brand__aa">A.A.</span>PNEUS</p>
              <p className="footer__tag">{t.footer.tagline}</p>
            </div>
          </div>
          <address className="footer__addr">
            {fullAddress}<br />
            <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a> · <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp {site.whatsappDisplay}</a>
          </address>
          <div className="footer__legal">
            <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer">{t.footer.complaints}</a>
            <p>© {year} {site.name}. {t.footer.rights}</p>
          </div>
        </div>
      </footer>

      <a href={whatsappUrl()} className="fab" target="_blank" rel="noopener noreferrer" aria-label={t.fab}>
        <WhatsAppIcon size={30} />
      </a>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
