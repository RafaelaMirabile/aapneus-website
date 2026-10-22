"use client";

import { useEffect, useId, useState } from "react";
import { CalendarDays, Clock, UtensilsCrossed } from "lucide-react";
import type { Dict, Locale } from "@/lib/i18n";
import { fmtTime, hours, site, whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "./BrandIcons";

type Service = keyof Dict["carwash"]["services"];

// A booking must fit entirely inside an opening range, so no slot runs into lunch or closing time.
const washMinutes = 60;
const slotStep = 30;
const daysShown = 12;
// Earliest a same-day slot can start, counted from now.
const minNotice = 60;

const intlLocale: Record<Locale, string> = { pt: "pt-PT", en: "en-GB", fr: "fr-FR", de: "de-DE", es: "es-ES" };

type Day = { iso: string; date: Date; weekday: number };

function lisbonToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { date: new Date(Date.UTC(get("year"), get("month") - 1, get("day"))), minutes: get("hour") * 60 + get("minute") };
}

/** Start times for a weekday, split by opening range (morning / afternoon). */
function slotsFor(weekday: number, notBefore = 0) {
  return hours[weekday].map(([s, e]) => {
    const out: number[] = [];
    for (let t = s; t + washMinutes <= e; t += slotStep) if (t >= notBefore) out.push(t);
    return out;
  });
}

function upcomingDays() {
  const { date, minutes } = lisbonToday();
  const days: Day[] = [];
  for (let i = 0; days.length < daysShown && i < daysShown * 2; i++) {
    const d = new Date(date.getTime() + i * 86_400_000);
    const weekday = d.getUTCDay();
    const notBefore = i === 0 ? minutes + minNotice : 0;
    if (slotsFor(weekday, notBefore).flat().length === 0) continue;
    days.push({ iso: d.toISOString().slice(0, 10), date: d, weekday });
  }
  return { days, todayIso: date.toISOString().slice(0, 10), nowMinutes: minutes };
}

export function CarWashBooking({ t, locale }: { t: Dict; locale: Locale }) {
  const c = t.carwash;
  const uid = useId();
  // Dates depend on the visitor's clock, so they are computed after mount to keep SSR markup stable.
  const [cal, setCal] = useState<ReturnType<typeof upcomingDays> | null>(null);
  const [service, setService] = useState<Service>("full");
  const [day, setDay] = useState("");
  const [time, setTime] = useState<number | null>(null);
  const [car, setCar] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => setCal(upcomingDays()), []);

  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "UTC", ...opts }).format(d);

  const selected = cal?.days.find((d) => d.iso === day);
  const groups = selected
    ? slotsFor(selected.weekday, day === cal?.todayIso ? cal.nowMinutes + minNotice : 0)
    : [];
  const lunch = selected && hours[selected.weekday].length > 1
    ? [hours[selected.weekday][0][1], hours[selected.weekday][1][0]]
    : null;

  const pickDay = (iso: string) => {
    setDay(iso);
    setTime(null);
    setError(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || time === null) {
      setError(true);
      return;
    }
    const dateText = fmt(selected.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const message = [
      c.message.greeting,
      `• ${c.message.service}: ${c.services[service]}`,
      `• ${c.message.date}: ${dateText}`,
      `• ${c.message.time}: ${fmtTime(time)}`,
      car.trim() && `• ${c.message.car}: ${car.trim()}`,
      name.trim() && `• ${c.message.name}: ${name.trim()}`,
      c.message.thanks,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappUrl(message, site.carWashWhatsapp), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="booking">
      <div className="booking__head">
        <p className="eyebrow eyebrow--red">{c.eyebrow}</p>
        <h2 id="carwash-title" className="h2">{c.title}</h2>
        <p className="booking__lead">{c.lead}</p>
        <ul className="booking__facts">
          <li><Clock size={18} aria-hidden="true" /> {c.factHours}</li>
          <li><UtensilsCrossed size={18} aria-hidden="true" /> {c.factLunch}</li>
          <li><WhatsAppIcon size={18} /> {c.factConfirm}</li>
        </ul>
      </div>

      <form className="booking__form" onSubmit={onSubmit} noValidate>
        <fieldset className="seg">
          <legend className="label">{c.service}</legend>
          <div className="seg__row">
            {(Object.keys(c.services) as Service[]).map((s) => (
              <label key={s} className="seg__opt">
                <input type="radio" name="wash-service" value={s} checked={service === s} onChange={() => setService(s)} />
                <span>{c.services[s]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="seg">
          <legend className="label">
            <CalendarDays size={16} aria-hidden="true" /> {c.day}
          </legend>
          <div className="days" aria-invalid={error && !day ? true : undefined}>
            {cal
              ? cal.days.map((d) => (
                  <label key={d.iso} className="day">
                    <input type="radio" name="wash-day" value={d.iso} checked={day === d.iso} onChange={() => pickDay(d.iso)} />
                    <span>
                      <small>{d.iso === cal.todayIso ? c.today : fmt(d.date, { weekday: "short" })}</small>
                      <strong>{fmt(d.date, { day: "numeric" })}</strong>
                      <small>{fmt(d.date, { month: "short" })}</small>
                    </span>
                  </label>
                ))
              : Array.from({ length: 6 }, (_, i) => <span key={i} className="day day--skeleton" aria-hidden="true" />)}
          </div>
        </fieldset>

        <fieldset className="seg">
          <legend className="label">
            <Clock size={16} aria-hidden="true" /> {c.time}
          </legend>
          {selected ? (
            <div className="slots">
              {groups.map((slots, gi) => (
                <div key={gi} className="slots__group">
                  {gi === 1 && lunch && (
                    <p className="slots__lunch">
                      <UtensilsCrossed size={14} aria-hidden="true" /> {fmtTime(lunch[0])}–{fmtTime(lunch[1])} · {c.lunchClosed}
                    </p>
                  )}
                  {slots.length > 0 && (
                    <div className="seg__row">
                      {slots.map((s) => (
                        <label key={s} className="seg__opt seg__opt--time">
                          <input
                            type="radio"
                            name="wash-time"
                            value={s}
                            checked={time === s}
                            onChange={() => {
                              setTime(s);
                              setError(false);
                            }}
                          />
                          <span>{fmtTime(s)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="slots__hint">{c.pickDayFirst}</p>
          )}
        </fieldset>

        <div className="booking__fields">
          <div>
            <label htmlFor={`${uid}-car`} className="label">{c.car} <span className="label__opt">{c.optional}</span></label>
            <input id={`${uid}-car`} className="input" value={car} onChange={(e) => setCar(e.target.value)} placeholder={c.carPlaceholder} autoComplete="off" />
          </div>
          <div>
            <label htmlFor={`${uid}-name`} className="label">{c.name} <span className="label__opt">{c.optional}</span></label>
            <input id={`${uid}-name`} className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
        </div>

        <p className="finder__error" role="alert">
          {error ? (day ? c.errorTime : c.errorDay) : ""}
        </p>

        <button type="submit" className="btn btn--whatsapp btn--lg finder__submit">
          <WhatsAppIcon size={22} />
          {c.send}
        </button>
      </form>
    </div>
  );
}
