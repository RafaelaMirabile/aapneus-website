"use client";

import { useEffect, useId, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, UtensilsCrossed } from "lucide-react";
import type { Dict, Locale } from "@/lib/i18n";
import { fmtTime, hours, site, whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "./BrandIcons";

type Service = keyof Dict["carwash"]["services"];

// A booking must fit entirely inside an opening range, so no slot runs into lunch or closing time.
const washMinutes = 60;
const slotStep = 30;
// How far ahead clients can book.
const bookAheadDays = 90;
// Earliest a same-day slot can start, counted from now.
const minNotice = 60;

const dayMs = 86_400_000;
const intlLocale: Record<Locale, string> = { pt: "pt-PT", en: "en-GB", fr: "fr-FR", de: "de-DE", es: "es-ES" };

// All dates are UTC midnights representing Lisbon calendar days.
const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonths = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));

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

/** Weeks of the month (Monday first), padded with nulls. */
function monthGrid(month: Date) {
  const lead = (month.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let i = 0; i < count; i++) cells.push(new Date(month.getTime() + i * dayMs));
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

export function CarWashBooking({ t, locale }: { t: Dict; locale: Locale }) {
  const c = t.carwash;
  const uid = useId();
  // "Today" depends on the visitor's clock, so it is computed after mount to keep SSR markup stable.
  const [now, setNow] = useState<ReturnType<typeof lisbonToday> | null>(null);
  const [service, setService] = useState<Service>("full");
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [car, setCar] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const n = lisbonToday();
    setNow(n);
    setMonth(monthStart(n.date));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "UTC", ...opts }).format(d);

  const isToday = (d: Date) => !!now && iso(d) === iso(now.date);
  const notBefore = (d: Date) => (isToday(d) && now ? now.minutes + minNotice : 0);
  const lastDay = now ? new Date(now.date.getTime() + bookAheadDays * dayMs) : null;
  const bookable = (d: Date) =>
    !!now && !!lastDay && d >= now.date && d <= lastDay && slotsFor(d.getUTCDay(), notBefore(d)).flat().length > 0;

  const firstMonth = now ? monthStart(now.date) : null;
  const finalMonth = lastDay ? monthStart(lastDay) : null;
  // Monday-first weekday headers (1 Jan 2024 was a Monday).
  const weekdays = Array.from({ length: 7 }, (_, i) => fmt(new Date(Date.UTC(2024, 0, 1 + i)), { weekday: "short" }));

  const groups = day ? slotsFor(day.getUTCDay(), notBefore(day)) : [];
  const dayHours = day ? hours[day.getUTCDay()] : [];
  const lunch = dayHours.length > 1 ? [dayHours[0][1], dayHours[1][0]] : null;

  const pickDay = (d: Date) => {
    setDay(d);
    setTime(null);
    setError(false);
    setOpen(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!day || time === null) {
      setError(true);
      return;
    }
    const dateText = fmt(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
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

        <div className="seg">
          <p className="label" id={`${uid}-day`}>
            <CalendarDays size={16} aria-hidden="true" /> {c.day}
          </p>
          <button
            type="button"
            className={`datefield ${day ? "" : "is-empty"}`}
            aria-labelledby={`${uid}-day ${uid}-dayvalue`}
            aria-expanded={open}
            aria-controls={`${uid}-cal`}
            aria-invalid={error && !day ? true : undefined}
            onClick={() => setOpen((v) => !v)}
            disabled={!now}
          >
            <CalendarDays size={20} aria-hidden="true" />
            <span id={`${uid}-dayvalue`}>
              {day ? fmt(day, { weekday: "long", day: "numeric", month: "long" }) : c.chooseDate}
            </span>
            <ChevronDown size={20} aria-hidden="true" className="datefield__chev" />
          </button>

          {open && month && firstMonth && finalMonth && (
            <div id={`${uid}-cal`} className="cal">
              <div className="cal__head">
                <button
                  type="button"
                  className="cal__nav"
                  onClick={() => setMonth(addMonths(month, -1))}
                  disabled={month <= firstMonth}
                  aria-label={c.prevMonth}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <p className="cal__month" aria-live="polite">{fmt(month, { month: "long", year: "numeric" })}</p>
                <button
                  type="button"
                  className="cal__nav"
                  onClick={() => setMonth(addMonths(month, 1))}
                  disabled={month >= finalMonth}
                  aria-label={c.nextMonth}
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
              <table className="cal__grid">
                <thead>
                  <tr>
                    {weekdays.map((w) => (
                      <th key={w} scope="col">{w.replace(".", "").slice(0, 3)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthGrid(month).map((week, wi) => (
                    <tr key={wi}>
                      {week.map((d, di) => (
                        <td key={di}>
                          {d && (
                            <button
                              type="button"
                              className={`cal__day ${isToday(d) ? "is-today" : ""}`}
                              disabled={!bookable(d)}
                              aria-pressed={day ? iso(d) === iso(day) : false}
                              aria-label={fmt(d, { weekday: "long", day: "numeric", month: "long" })}
                              onClick={() => pickDay(d)}
                            >
                              {d.getUTCDate()}
                            </button>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="cal__note">{c.calendarNote}</p>
            </div>
          )}
        </div>

        <fieldset className="seg">
          <legend className="label">
            <Clock size={16} aria-hidden="true" /> {c.time}
          </legend>
          {day ? (
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
